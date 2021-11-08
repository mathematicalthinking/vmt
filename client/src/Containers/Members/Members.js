// ALSO CONSIDER MOVING GRANTACCESS() FROM COURSE CONTAINER TO HERE
// EXTRACT OUT THE LAYOUT PORTION INTO THE LAYYOUT FOLDER
import React, { PureComponent, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { CSVReader } from 'react-papaparse';
import { Member, Search, Modal, Button, InfoBox } from 'Components';
import Slider from 'Components/UI/Button/Slider';
import COLOR_MAP from 'utils/colorMap';
import API from 'utils/apiRequests';
import { suggestUniqueUsername, validateExistingField } from 'utils/validators';
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
import Importer from '../../Components/Importer/Importer';
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
      rowConfig: [],
      resolveSelections: {},
      isCourseOnly: false,
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
      // Don't invite someone if they are already in the course
      const alreadyInCourse =
        courseMembers && courseMembers.find((mem) => mem.user._id === id);
      if (!alreadyInCourse) connectInviteToCourse(resourceId, id, username);
    } else if (courseMembers) {
      const inCourse = courseMembers.filter(
        (member) => member.user._id === id
      )[0];
      if (!inCourse) {
        confirmingInvitation = true;
      } else {
        connectInviteToRoom(resourceId, id, username, color, {}); // @TODO **WHY** do we invite a user if they are already in the course?!?
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
    const { classList, courseMembers } = this.props;
    const { isCourseOnly } = this.state;
    if (text.length > 0) {
      // prettier-ignore
      API.search(
        'user',
        text,
        classList.map((member) => member.user._id)
      )
        .then((res) => {
          const searchResults = res.data.results.filter((user) => {
            if (user.accountType === 'temp') return false;
            if (isCourseOnly) {
              return courseMembers.some((mem) => mem.user._id === user._id);
            }
            return true;
          });
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

  /** *************************************************************
   * FUNCTIONS IMPLEMENTING IMPORT
   * **************************************************************
   */

  handleOpenDialog = (e) => {
    // Note that the ref is set async, so it might be null at some point
    if (this.buttonRef.current) {
      this.buttonRef.current.open(e);
    }
  };

  /**
   * Checks the data in a row of a table. Returns an array with two elements:
   * 1. the row of data (with any changes, such as comments)
   * 2. an array of errors.
   *
   * The types of errors looked for:
   * 1. Username/email: A mis-match between an existing username and email. In this case, we want to cue the resolution by
   * the importer. The person can chose: (a) go by username (only if username exists), in which case the email for that username gets filled in. (b) go
   * by email (only if the emailalready exists), in which case the username for that email is filled in, (c) create a new user.
   * In case (c), if the username exists a new one is suggested. If the email exists, we clear it out (new user will have no
   * email).
   * 2. Duplicate usernames or emails in the import list.
   * 3. If a new user, first and last names must be there.
   * 4. If a sponsor is given, it must be an existing user.
   * 5. If an email is blank, this cannot be a gmail account.
   */
  validateDataRow = async (dataRow, rowIndex) => {
    const { importedData } = this.state;
    // initialization, including default username if needed
    const validationErrors = [];
    const d = { ...dataRow };
    if (!d.isGmail) d.isGmail = false; // initialize if needed
    d.comment = '';
    d.username = (
      d.username.trim() || d.firstName.trim() + d.lastName.charAt(0)
    ).toLowerCase();
    if (d.email) {
      d.email = d.email.toLowerCase().trim();
    }
    this.setState(({ resolveSelections }) => {
      resolveSelections[rowIndex] = null;
      return { resolveSelections };
    });

    // 1. handle validating whether username/email exists, whether they are consistent, and the resolution thereof
    this.clearChoices(rowIndex);
    const userFromUsername = await validateExistingField(
      'username',
      d.username
    );
    const userFromEmail = d.email
      ? await validateExistingField('email', d.email)
      : null;
    const isMatch =
      userFromUsername &&
      userFromEmail &&
      userFromUsername._id === userFromEmail._id;
    const isNewUser = !userFromEmail && !userFromUsername;

    if (!isMatch && !isNewUser) {
      d.comment += 'Username-email mismatch. ';
      validationErrors.push(
        { rowIndex, property: 'username' },
        { rowIndex, property: 'email' }
      );
      suggestUniqueUsername(d.username).then((name) => {
        const newUser = {
          username: name,
          email: userFromEmail ? '<enter an email>' : d.email,
        };
        const choices = {
          newUser,
          userFromUsername,
          userFromEmail,
          original: { ...d },
        };
        this.setupChoices(choices, rowIndex);
      });
    }

    // 2. handle duplicate email or usernames in the list
    let emailDup = 0;
    let usernameDup = 0;
    importedData.forEach((u) => {
      if (u.username.toLowerCase() === d.username.toLowerCase()) {
        usernameDup += 1;
      }
      if (!!u.email && u.email === d.email) {
        emailDup += 1;
      }
    });

    if (emailDup > 1) {
      d.comment += 'Email duplicated in list. ';
      validationErrors.push({ rowIndex, property: 'email' });
    }

    if (usernameDup > 1) {
      d.comment += 'Username duplicated in list. ';
      validationErrors.push({ rowIndex, property: 'username' });
    }

    // 3. handle validating that new users must have first and last names specified
    if (isNewUser && (!d.firstName || !d.lastName)) {
      d.comment += 'First and last names are required. ';
      if (!d.firstName)
        validationErrors.push({ rowIndex, property: 'firstName' });
      if (!d.lastName)
        validationErrors.push({ rowIndex, property: 'lastName' });
    }

    // 4. handle validating that any specified sponsors must be existing users
    if (d.sponsor && d.sponsor !== '') {
      const { _id: sponsor_id } = await validateExistingField(
        'username',
        d.sponsor
      );
      if (sponsor_id)
        this.setState((prevState) => ({
          sponsors: { ...prevState.sponsors, [d.username]: sponsor_id },
        }));
      else {
        d.comment += 'No such sponsor username. ';
        validationErrors.push({ rowIndex, property: 'sponsor' });
      }
    }

    // 5. handle validating that a blank email cannot be a gmail account
    if (d.email === '' && d.isGmail) {
      d.comment += 'Google login may only be used if an email is specified. ';
      validationErrors.push(
        { rowIndex, property: 'email' },
        { rowIndex, property: 'isGmail' }
      );
    }

    return [d, validationErrors];
  };

  // Checks each row of the data for validation issues, returning an array of two elements:
  // 1. the data with any changes (e.g., comments about what's wrong)
  // 2. an array of pointers to the data that were problematic. Each element of the array is of the
  //    form {rowIndex, property}, where rowIndex is the row of the line that contains the error and
  //    property is the name of the data property that had the error.
  //
  // The rows argument is optional. If not given, goes through all data
  validateData = async (data, rows) => {
    // first check for validation issues on all requested rows of the provided data, in parallel.
    const validatedInfo = await Promise.all(
      rows === undefined
        ? data.map(async (d, index) => this.validateDataRow(d, index))
        : rows.map(async (row) => this.validateDataRow(data[row], row))
    );
    // next, reconfigure the results of the above call so that we accumulate the data rows and errors
    // gathered above. validatedData will be an array of each row. For validationsErrors, because there can be
    // more than one error on each row, we have to use a spread operator in accumulation so that we
    // end up wth a simple array of errors.
    const [validatedData, validationErrors] = await validatedInfo.reduce(
      ([accData, accErrors], [dataRow, rowErrors]) => [
        [...accData, dataRow],
        [...accErrors, ...rowErrors],
      ],
      [[], []]
    );
    return [validatedData, validationErrors];
  };

  /**
   * The user needs to resolve a mismatch between username and email. Update rowConfig to place a ResolutionButton at that
   * row, containing the buttons needed (some combination of username, email, new user). As each selection is made, update
   * the data so that appropriate usernames and emails are shown.  NOTE: only change username and email; don't change any
   * other data in the row.
   *
   * Note: We have to keep the resolution state here because the package used by ImportModal unmounts and remounts elements
   * on each refresh. @TODO: Switch to another package for rendering an editable table.
   */

  setupChoices = (choices, rowIndex) => {
    const action = () => (
      <ResolutionButton
        usernameChoice={choices.userFromUsername || null}
        emailChoice={choices.userFromEmail || null}
        newUserChoice={choices.newUser || null}
        selection={() => {
          const { resolveSelections } = this.state;
          return resolveSelections[rowIndex] || null;
        }}
        onSelect={(choice) => {
          if (!choice) {
            choice = {
              username: choices.original.username,
              email: choices.original.email,
            };
          }
          this.setState((prevState) => {
            const newData = [...prevState.importedData];
            newData[rowIndex].username = choice.username;
            newData[rowIndex].email = choice.email;
            return {
              importedData: newData,
              resolveSelections: {
                ...prevState.resolveSelections,
                [rowIndex]: choice,
              },
            };
          });
        }}
      />
    );
    this.setState((prevState) => ({
      rowConfig: [...prevState.rowConfig, { rowIndex, action }],
    }));
  };

  // Remove any buttons from the previous validation
  clearChoices = (rowIndex) => {
    this.setState((prevState) => ({
      rowConfig: prevState.rowConfig
        ? prevState.rowConfig.filter((config) => config.rowIndex !== rowIndex)
        : [],
    }));
  };

  handleOnFileLoad = async (data) => {
    const extractedData = data
      .map((d) => d.data)
      .filter((d) => Object.values(d).some((val) => val !== '')); // ignore any blank lines
    const [importedData, validationErrors] = await this.validateData(
      extractedData
    );
    this.setState({ showImportModal: true, importedData, validationErrors });
  };

  handleOnError = (err) => {
    console.log(err);
  };

  handleOnDeleteRow = (row) => {
    const { importedData: originalData } = this.state;
    const newData = [...originalData];
    newData.splice(row, 1);
    this.setState({ importedData: newData }, async () => {
      const [importedData, validationErrors] = await this.validateData(newData);
      this.setState({ importedData, validationErrors });
    });
  };

  // 'changes' is an array of objects of the form {rowIndex, property: value}. For each unique row, we want to run
  // the validator on the data in that row.
  handleOnChanged = (changes) => {
    const { importedData, validationErrors } = this.state;
    const rowsToCheck = Array.from(new Set(changes.map((c) => c.rowIndex)));

    // Make copies of the existing state -- data and errors. Clear out any errors among the rows we are revalidating (as
    // specified within 'changes'). Make whatever changes to the data needed as per the 'changes' parameter
    const newData = [...importedData];
    const newValidationErrors = validationErrors.filter(
      (err) => !rowsToCheck.includes(err.rowIndex)
    );
    changes.forEach(
      // eslint-disable-next-line no-return-assign
      ({ rowIndex, ...rest }) =>
        (newData[rowIndex] = { ...newData[rowIndex], ...rest })
    );

    // revalidate the rows that had changes. Place each validated row into the correct place in the newData and merge
    // any new errors
    this.validateData(newData, rowsToCheck).then(([validatedData, errors]) => {
      rowsToCheck.forEach(
        // eslint-disable-next-line no-return-assign
        (row, index) => (newData[row] = validatedData[index])
      );
      this.setState({
        importedData: newData,
        validationErrors: [...newValidationErrors, ...errors],
      });
    });
  };

  handleOnCancel = () => this.setState({ showImportModal: false });

  // Called when the user clicks on 'Submit' in the modal. Revalidate all the data. If there are any issues, update the data
  // and highligt any relevant cells. If no issues, update the data, create any new users, and invite them to the course.
  handleOnSubmit = (data) => {
    const { validationErrors } = this.state;
    if (validationErrors.length > 0) {
      this.validateData(data).then(([newData, newValidationErrors]) => {
        this.setState({
          importedData: newData,
          validationErrors: newValidationErrors,
        });
      });
    } else {
      this.setState({
        showImportModal: false,
      });
      this.createAndInviteMembers();
    }
  };

  createAndInviteMembers = async () => {
    const { importedData, sponsors } = this.state;
    const { user: creator } = this.props;
    const userObjects = await Promise.all(
      importedData.map(async (user) => {
        const existingUser = await validateExistingField(
          'username',
          user.username
        );
        const { organization, identifier, ...rest } = user;
        return existingUser
          ? {
              ...existingUser,
              metadata: { organization, identifier },
              sponsor: sponsors[user.username] || creator._id,
            }
          : {
              accountType: 'pending',
              ...rest,
              metadata: { organization, identifier },
              sponsor: sponsors[user.username] || creator._id,
            };
      })
    );

    const newUsers = await Promise.all(
      userObjects.map(async (user) =>
        user._id
          ? API.put('user', user._id, user).then(() => {
              return user;
            })
          : API.post('user', user).then((res) => {
              return res.data.result;
            })
      )
    );

    newUsers.forEach((user) => this.inviteMember(user._id, user.username));
  };

  // These next two are functions to defeat the linter...
  csvItem = () => {
    const { resourceType } = this.props;
    return resourceType === 'course' ? (
      <Fragment>
        <div className={classes.Instructions}>
          <i className="far fa-question-circle fa-2x" />
          <div className={classes.TooltipContent}>
            <p>
              The search bar allows for the searching and addition of existing
              VMT Users. By using the Import feature, new users can be created
              for your course. <br /> For csv formatting and importing guides,
              please see the VMT{' '}
              <NavLink
                exact
                to="/instructions"
                className={classes.Link}
                activeStyle={{ borderBottom: '1px solid #2d91f2' }}
              >
                Instructions
              </NavLink>
            </p>
          </div>
        </div>

        <CSVReader
          ref={this.buttonRef}
          onFileLoad={this.handleOnFileLoad}
          onError={this.handleOnError}
          config={{ header: true, skipEmptyLines: true }}
          noProgressBar
          noDrag
        >
          {/* Undocumented feature of CSVReader is that providing a function allows for a custom UI */}
          {() => (
            <Button click={this.handleOpenDialog}>Import New Users</Button>
          )}
        </CSVReader>
      </Fragment>
    ) : null;
  };

  importModal = () => {
    const {
      showImportModal,
      importedData,
      validationErrors,
      rowConfig,
    } = this.state;
    return (
      <ImportModal
        show={showImportModal}
        data={importedData}
        columnConfig={[
          { property: 'username', header: 'Username*' },
          { property: 'email', header: 'Email' },
          {
            property: 'isGmail',
            header: 'Require Login via Google with Email',
            type: 'boolean',
          },
          { property: 'firstName', header: 'First Name*' },
          {
            property: 'lastName',
            header: 'Last Name* (full, inital, or other)',
          },
          { property: 'organization', header: 'Affiliation' },
          { property: 'identifier', header: 'Student or Org ID' },
          { property: 'sponsor', header: 'Teacher VMT Username' },
          {
            property: 'comment',
            header: 'Comments (* req)',
            style: { color: 'red' },
            readOnly: true,
          },
        ]}
        highlights={validationErrors}
        rowConfig={rowConfig}
        onChanged={this.handleOnChanged}
        onSubmit={this.handleOnSubmit}
        onCancel={this.handleOnCancel}
        onDeleteRow={this.handleOnDeleteRow}
      />
    );
  };

  // Within Members. <Importer user={user} onImport={handleImport} />
  handleImport = (userObjects) => {
    Promise.all(
      userObjects.map(async (user) =>
        user._id
          ? API.put('user', user._id, user).then(() => {
              return user;
            })
          : API.post('user', user).then((res) => {
              return res.data.result;
            })
      )
    ).then((newUsers) =>
      newUsers.forEach((user) => this.inviteMember(user._id, user.username))
    );
  };

  /**
   *********************************************
   * END OF FUNCTIONS IMPLEMENTING IMPORT
   *********************************************
   */

  render() {
    const {
      classList,
      notifications,
      owner,
      user,
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
      isCourseOnly,
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
              rightIcons={
                // this.csvItem()
                resourceType === 'course' ? (
                  <Importer user={user} onImport={this.handleImport} />
                ) : null
              }
            >
              <Fragment>
                <Search
                  data-testid="member-search"
                  _search={this.search}
                  placeholder="search existing VMT users by username or email address"
                />
                {searchResults.length > 0 ? (
                  <SearchResults
                    searchText={searchText}
                    usersSearched={searchResults}
                    inviteMember={this.inviteMember}
                  />
                ) : null}
                {resourceType === 'room' && courseMembers ? (
                  <div className={classes.ToggleContainer}>
                    <Slider
                      data-testid="search-toggle"
                      action={() => {
                        this.setState(
                          (prevState) => ({
                            isCourseOnly: !prevState.isCourseOnly,
                          }),
                          () => {
                            this.search(searchText);
                          }
                        );
                      }}
                      isOn={isCourseOnly}
                      name="isCourseOnly"
                    />
                    <span className={classes.Email}>
                      {isCourseOnly
                        ? ' Toggle to Search all VMT users '
                        : ' Toggle to Search only for course members '}
                    </span>
                  </div>
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

function ResolutionButton(props) {
  const {
    usernameChoice,
    emailChoice,
    newUserChoice,
    onSelect,
    selection,
  } = props;

  const _handleSelect = (select) => {
    if (select === selection()) {
      onSelect(null);
    } else {
      onSelect(select);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
      }}
    >
      {usernameChoice && (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => _handleSelect(usernameChoice)}
          onKeyPress={() => _handleSelect(usernameChoice)}
          title="Use existing username"
        >
          <i
            className="fas fa-user"
            style={{
              color: selection() === usernameChoice ? '#66ff00' : 'black',
            }}
          />
        </div>
      )}
      {emailChoice && (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => _handleSelect(emailChoice)}
          onKeyPress={() => _handleSelect(emailChoice)}
          title="Use existing email"
        >
          <i
            className="fas fa-envelope"
            style={{ color: selection() === emailChoice ? '#66ff00' : 'black' }}
          />
        </div>
      )}
      {newUserChoice && (
        <div
          role="button"
          tabIndex={-1}
          onClick={() => _handleSelect(newUserChoice)}
          onKeyPress={() => _handleSelect(newUserChoice)}
          title="Create new user"
        >
          <i
            className="fas fa-user-plus"
            style={{
              color: selection() === newUserChoice ? '#66ff00' : 'black',
            }}
          />
        </div>
      )}
    </div>
  );
}

ResolutionButton.propTypes = {
  usernameChoice: PropTypes.shape({}),
  emailChoice: PropTypes.shape({}),
  newUserChoice: PropTypes.shape({}),
  onSelect: PropTypes.func.isRequired,
  selection: PropTypes.func,
};

ResolutionButton.defaultProps = {
  usernameChoice: null,
  emailChoice: null,
  newUserChoice: null,
  selection: null,
};

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

// prettier-ignore
export default connect(mapStateToProps, {
  connectGrantAccess: grantAccess,
  connectUpdateCourseMembers: updateCourseMembers,
  connectUpdateRoomMembers: updateRoomMembers,
  connectInviteToCourse: inviteToCourse,
  connectInviteToRoom: inviteToRoom,
  connectClearNotification: clearNotification,
  connectRemoveRoomMember: removeRoomMember,
  connectRemoveCourseMember: removeCourseMember,
})(Members);
