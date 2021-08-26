// ALSO CONSIDER MOVING GRANTACCESS() FROM COURSE CONTAINER TO HERE
// EXTRACT OUT THE LAYOUT PORTION INTO THE LAYYOUT FOLDER
import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CSVReader } from 'react-papaparse';
import { Member, Search, Modal, Button, InfoBox } from 'Components';
import COLOR_MAP from 'utils/colorMap';
import API from 'utils/apiRequests';
import {
  suggestUniqueUsername,
  validateIsExistingUsername,
} from 'utils/validators';
import {
  grantAccess,
  updateCourseMembers,
  updateRoomMembers,
  inviteToCourse,
  inviteToRoom,
  clearNotification,
  removeCourseMember,
  removeRoomMember,
} from 'store/actions';
import { getAllUsersInStore } from 'store/reducers';
import SearchResults from './SearchResults';
import ImportModal from './ImportModal';
import classes from './members.css';

class Members extends PureComponent {
  constructor(props) {
    super(props);
    const { searchedUsers } = this.props;
    this.state = {
      searchText: '',
      searchResults: searchedUsers,
      confirmingInvitation: false,
      userId: null,
      username: null,
      showImportModal: false,
      importedData: [],
      validationErrors: [],
      sponsors: {},
    };
    this.buttonRef = React.createRef();
  }

  // componentDidUpdate(prevProps) {
  //   const { classList } = this.props;
  //   // fill in colors for members not yet pulled from store
  //   if (prevProps.classList.length !== classList.length) {
  //     console.log('Updating classlist: ', classList);
  //     classList.forEach((mem) => {
  //       if (!mem.color) {
  //         mem.color = COLOR_MAP[classList.length || 0];
  //       }
  //     });
  //   }
  // }

  componentWillUnmount() {
    const { notifications, connectClearNotification } = this.props;
    if (notifications.length > 0) {
      notifications.forEach((ntf) => {
        if (ntf.notificationType === 'newMember') {
          connectClearNotification(ntf._id);
        }
      });
    }
  }

  inviteMember = (id, username) => {
    let confirmingInvitation = false;
    const {
      resourceId,
      resourceType,
      courseMembers,
      connectInviteToCourse,
      connectInviteToRoom,
      classList,
    } = this.props;
    const color = COLOR_MAP[classList.length];
    if (resourceType === 'course') {
      connectInviteToCourse(resourceId, id, username);
    } else if (courseMembers) {
      const inCourse = courseMembers.filter(
        (member) => member.user._id === id
      )[0];
      if (!inCourse) {
        confirmingInvitation = true;
      } else {
        connectInviteToRoom(resourceId, id, username, color, {});
      }
    } else {
      connectInviteToRoom(resourceId, id, username, color);
    }
    this.setState((prevState) => ({
      confirmingInvitation,
      // Remove the invited member from the search results
      searchResults: prevState.searchResults.filter((user) => user._id !== id),
      username: confirmingInvitation ? username : null,
      userId: confirmingInvitation ? id : null,
    }));
  };

  confirmInvitation = () => {
    const {
      parentResource,
      resourceId,
      connectInviteToCourse,
      connectInviteToRoom,
      classList,
    } = this.props;
    const color = COLOR_MAP[classList.length];
    const { userId, username } = this.state;
    connectInviteToCourse(parentResource, userId, username, {
      guest: true,
    });
    connectInviteToRoom(resourceId, userId, username, color, {});
    this.setState({
      confirmingInvitation: false,
      username: null,
      userId: null,
    });
  };

  removeMember = (info) => {
    const {
      resourceId,
      resourceType,
      connectRemoveCourseMember,
      connectRemoveRoomMember,
    } = this.props;
    if (resourceType === 'course') {
      connectRemoveCourseMember(resourceId, info.user._id);
    } else connectRemoveRoomMember(resourceId, info.user._id);
  };
  /**
   * @method changeRole
   * @param  {Object} info - member obj { color, _id, role, {_id, username}}
   */

  changeRole = (info) => {
    const {
      classList,
      resourceId,
      resourceType,
      connectUpdateRoomMembers,
      connectUpdateCourseMembers,
    } = this.props;
    const updatedMembers = classList.map((member) => {
      return member.user._id === info.user._id
        ? { role: info.role, user: info.user._id, color: info.color }
        : { role: member.role, user: member.user._id, color: member.color };
    });
    if (resourceType === 'course') {
      connectUpdateCourseMembers(resourceId, updatedMembers);
    } else connectUpdateRoomMembers(resourceId, updatedMembers);
  };

  // Consider finding a way to NOT duplicate this in MakeRooms and also now in Profile
  search = (text) => {
    const { classList } = this.props;
    if (text.length > 0) {
      API.search('user', text, classList.map((member) => member.user._id))
        .then((res) => {
          const searchResults = res.data.results.filter(
            (user) => user.accountType !== 'temp'
          );
          this.setState({ searchResults, searchText: text });
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log('err: ', err);
        });
    } else {
      this.setState({ searchResults: [], searchText: text });
    }
  };

  /**
   * FUNCTIONS IMPLEMENTING IMPORT
   */

  handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (this.buttonRef.current) {
      this.buttonRef.current.open(e);
    }
  };

  validateData = async (data) => {
    const validationErrors = [];
    const validatedData = await Promise.all(
      data.map(async (d, rowIndex) => {
        if (!d.isGmail) d.isGmail = false; // initialize if needed
        d.comment = '';
        if (!d.firstName || !d.lastName) {
          d.comment = 'First and last names (or identifier) are required. ';
          if (!d.firstName)
            validationErrors.push({ rowIndex, property: 'firstName' });
          if (!d.lastName)
            validationErrors.push({ rowIndex, property: 'lastName' });
        } else {
          const username = d.username || d.firstName + d.lastName.charAt(0);
          const newUsername = await suggestUniqueUsername(username);
          if (newUsername !== d.username) {
            d.comment = 'New username suggested. ';
            d.username = newUsername;
            validationErrors.push({ rowIndex, property: 'username' });
          }
        }

        if (d.sponsor && d.sponsor !== '') {
          const sponsor_id = await validateIsExistingUsername(d.sponsor);
          if (sponsor_id)
            this.setState((prevState) => ({
              sponsors: { ...prevState.sponsors, [d.username]: sponsor_id },
            }));
          else {
            d.comment += 'No such sponsor username. ';
            validationErrors.push({ rowIndex, property: 'sponsor' });
          }
        }
        return d;
      })
    );
    // this.setState({ validationErrors });
    return [validatedData, validationErrors];
  };

  handleOnFileLoad = async (data) => {
    const extractedData = data
      .map((d) => d.data)
      .filter((d) => Object.values(d).some((val) => val !== ''));
    const [importedData, validationErrors] = await this.validateData(
      extractedData
    );
    this.setState({ showImportModal: true, importedData, validationErrors });
  };

  handleOnError = (err) => {
    console.log(err);
  };

  handleOnChanged = (data) => {
    this.validateData(data).then(([newData, validationErrors]) => {
      const hasIssues = validationErrors.length > 0;
      if (hasIssues) this.setState({ importedData: newData, validationErrors });
    });
  };

  handleOnCancel = () => this.setState({ showImportModal: false });

  handleOnSubmit = (data) => {
    this.validateData(data).then(([newData, validationErrors]) => {
      const hasIssues = validationErrors.length > 0;
      if (hasIssues) this.setState({ importedData: newData, validationErrors });
      else {
        this.setState({
          showImportModal: false,
          importedData: newData,
          validationErrors,
        });
        this.createAndInviteMembers();
      }
    });
  };

  createAndInviteMembers = async () => {
    const { importedData, sponsors } = this.state;
    const { user: creator } = this.props;
    const newUsers = await Promise.all(
      importedData.map(async (user) =>
        API.post('user', {
          ...user,
          sponsor: sponsors[user.username] || creator._id,
          accountType: 'pending',
        })
      )
    );
    newUsers.forEach(({ data: { result: user } }) =>
      this.inviteMember(user._id, user.username)
    );
  };

  // These next two are functions to defeat the linter...
  csvItem = () => {
    const { resourceType } = this.props;
    return resourceType === 'course' ? (
      <CSVReader
        ref={this.buttonRef}
        onFileLoad={this.handleOnFileLoad}
        onError={this.handleOnError}
        config={{ header: true, skipEmptyLines: true }}
        noProgressBar
        noDrag
      >
        {/* Undocumented feature of CSVReader is that providing a function allows for a custom UI */}
        {() => <Button click={this.handleOpenDialog}>Import New Users</Button>}
      </CSVReader>
    ) : null;
  };

  importModal = () => {
    const { showImportModal, importedData, validationErrors } = this.state;
    return (
      <ImportModal
        show={showImportModal}
        data={importedData}
        columnConfig={[
          { property: 'username', header: 'Username' },
          { property: 'email', header: 'Email' },
          {
            property: 'isGmail',
            header: 'Email is Google Account',
            type: 'boolean',
          },
          { property: 'firstName', header: 'First Name' },
          { property: 'lastName', header: 'Last Name or Other Identifier' },
          { property: 'organization', header: 'Affiliation' },
          { property: 'sponsor', header: 'Sponsor Username' },
          {
            property: 'comment',
            header: 'Comments',
            style: { color: 'red' },
            readOnly: true,
          },
        ]}
        highlights={validationErrors}
        // onChanged={(data) => this.handleOnChanged(data)}
        onSubmit={(data) => this.handleOnSubmit(data)}
        onCancel={this.handleOnCancel}
      />
    );
  };

  /* ***********************************  */

  render() {
    const {
      classList,
      notifications,
      owner,
      resourceType,
      resourceId,
      courseMembers,
      connectGrantAccess,
      connectClearNotification,
    } = this.props;
    const {
      confirmingInvitation,
      username,
      searchResults,
      searchText,
    } = this.state;

    let joinRequests = <p>There are no new requests to join</p>;
    if (owner && notifications.length >= 1) {
      joinRequests = notifications
        .filter((ntf) => ntf.notificationType === 'requestAccess')
        .map((ntf) => {
          return (
            <Member
              grantAccess={() => {
                connectGrantAccess(
                  ntf.fromUser._id,
                  resourceType,
                  resourceId,
                  ntf._id,
                  ntf.toUser
                );
              }}
              resourceName={resourceType}
              rejectAccess={() => {
                connectClearNotification(ntf._id);
              }}
              info={ntf.fromUser}
              key={ntf._id}
            />
          );
        });
    }
    const filteredClassList = [];
    const guestList = [];
    // console.log("Class list: ", classList);
    classList.forEach((member) => {
      if (member.role === 'guest') {
        guestList.push(member);
      } else {
        filteredClassList.push(member);
      }
    });
    const classListComponents = filteredClassList.map((member) => {
      // at least sometimes member is just user object so there is no member.user property /// <-- well thats not good, how did that happen? this hsould be consistant
      const userId = member.user ? member.user._id : member._id;
      // checking for notification...newMember type indicates this user has added themself by entering the entryCode
      const notification = notifications.filter((ntf) => {
        if (ntf.fromUser && ntf.notificationType === 'newMember') {
          return ntf.fromUser._id === userId;
        }
        return false;
      });

      return owner ? (
        <Member
          changeRole={this.changeRole}
          removeMember={this.removeMember}
          info={member}
          key={member.user._id}
          resourceName={resourceType}
          notification={notification.length > 0}
          owner
        />
      ) : (
        <Member
          info={member}
          key={member.user._id}
          resourceName={resourceType}
        />
      );
    });

    const guestListComponents = guestList.map((member) => {
      return owner ? (
        <Member
          changeRole={this.changeRole}
          removeMember={this.removeMember}
          info={member}
          key={member.user._id}
          resourceName={resourceType}
          owner
        />
      ) : (
        <Member info={member} key={member.user._id} />
      );
    });
    return (
      <div className={classes.Container}>
        {this.importModal()}
        <Modal
          show={confirmingInvitation}
          closeModal={() => this.setState({ confirmingInvitation: false })}
        >
          <div>
            {username} is not in this course...you can still add them to this
            room and they will be added to the course as a guest
          </div>
          <div>
            <Button m={5} click={this.confirmInvitation}>
              Add To Room
            </Button>
            <Button
              theme="Cancel"
              m={5}
              click={() => {
                this.setState({ confirmingInvitation: false });
              }}
            >
              Cancel
            </Button>
          </div>
        </Modal>
        <div>
          {owner ? (
            <InfoBox
              title="Add Participants"
              icon={<i className="fas fa-user-plus" />}
              rightIcons={this.csvItem()}
            >
              <Fragment>
                <Search
                  data-testid="member-search"
                  _search={this.search}
                  placeholder="search by username or email address"
                />
                {searchResults.length > 0 ? (
                  <SearchResults
                    searchText={searchText}
                    usersSearched={searchResults}
                    inviteMember={this.inviteMember}
                  />
                ) : null}
                <div>Add current VMT users</div>
                {resourceType === 'room' && courseMembers ? (
                  <div>(participants from this course or guests)</div>
                ) : null}
              </Fragment>
            </InfoBox>
          ) : null}
          {owner ? (
            <InfoBox
              title="New Requests to Join"
              icon={<i className="fas fa-bell" />}
            >
              <div data-testid="join-requests">{joinRequests}</div>
            </InfoBox>
          ) : null}
          <InfoBox title="Class List" icon={<i className="fas fa-users" />}>
            <div data-testid="members">{classListComponents}</div>
          </InfoBox>
          <InfoBox title="Guest List" icon={<i className="fas fa-id-badge" />}>
            <div data-testid="members">
              {guestListComponents.length > 0
                ? guestListComponents
                : `There are no guests in this ${resourceType}`}
            </div>
          </InfoBox>
        </div>
      </div>
    );
  }
}

Members.propTypes = {
  searchedUsers: PropTypes.arrayOf(PropTypes.shape({})),
  user: PropTypes.shape({}).isRequired,
  notifications: PropTypes.arrayOf(PropTypes.shape({})),
  resourceId: PropTypes.string.isRequired,
  resourceType: PropTypes.string.isRequired,
  courseMembers: PropTypes.arrayOf({}),
  owner: PropTypes.bool.isRequired,
  parentResource: PropTypes.string,
  classList: PropTypes.arrayOf(PropTypes.shape({})),
  connectGrantAccess: PropTypes.func.isRequired,
  connectUpdateCourseMembers: PropTypes.func.isRequired,
  connectUpdateRoomMembers: PropTypes.func.isRequired,
  connectInviteToCourse: PropTypes.func.isRequired,
  connectInviteToRoom: PropTypes.func.isRequired,
  connectClearNotification: PropTypes.func.isRequired,
  connectRemoveRoomMember: PropTypes.func.isRequired,
  connectRemoveCourseMember: PropTypes.func.isRequired,
};

Members.defaultProps = {
  searchedUsers: [],
  classList: [],
  courseMembers: null,
  notifications: null,
  parentResource: null,
};
const mapStateToProps = (state, ownProps) => {
  // STart the search results populated with people already in the store
  const usersToExclude = ownProps.classList.map((member) => member.user._id);
  const allUsers = getAllUsersInStore(state, usersToExclude);
  const userIds = [...allUsers.userIds].slice(0, 5);
  const usernames = [...allUsers.usernames].slice(0, 5);
  return {
    searchedUsers: userIds.map((id, i) => ({
      _id: id,
      username: usernames[i],
    })),
    user: state.user,
  };
};

export default connect(
  mapStateToProps,
  {
    connectGrantAccess: grantAccess,
    connectUpdateCourseMembers: updateCourseMembers,
    connectUpdateRoomMembers: updateRoomMembers,
    connectInviteToCourse: inviteToCourse,
    connectInviteToRoom: inviteToRoom,
    connectClearNotification: clearNotification,
    connectRemoveRoomMember: removeRoomMember,
    connectRemoveCourseMember: removeCourseMember,
  }
)(Members);
