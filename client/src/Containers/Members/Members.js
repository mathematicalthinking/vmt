// ALSO CONSIDER MOVING GRANTACCESS() FROM COURSE CONTAINER TO HERE
// EXTRACT OUT THE LAYOUT PORTION INTO THE LAYYOUT FOLDER
import React, { PureComponent, Fragment } from "react";
import { connect } from "react-redux";
import API from "../../utils/apiRequests";
import {
  grantAccess,
  updateCourseMembers,
  updateRoomMembers,
  inviteToCourse,
  inviteToRoom,
  clearNotification,
  removeCourseMember,
  removeRoomMember
} from "../../store/actions";
import { getAllUsersInStore } from "../../store/reducers/";
import { Member, Search, Modal, Button } from "../../Components";
import SearchResults from "./SearchResults";
import classes from "./members.css";

class Members extends PureComponent {
  state = {
    searchText: "",
    searchResults: this.props.searchedUsers || [],
    confirmingInvitation: false,
    userId: null,
    username: null
  };

  renderCount = 0;
  componentWillUnmount() {
    const { notifications } = this.props;
    if (notifications.length > 0) {
      notifications.forEach(ntf => {
        if (ntf.notificationType === "newMember") {
          this.props.clearNotification(ntf._id);
        }
      });
    }
  }

  inviteMember = (id, username) => {
    let confirmingInvitation = false;
    let { resourceId, resourceType, courseMembers } = this.props;
    if (resourceType === "course") {
      this.props.inviteToCourse(resourceId, id, username);
    } else {
      // If this is a course room check the member being added to the room already belongs to the course
      if (courseMembers) {
        let inCourse = courseMembers.filter(
          member => member.user._id === id
        )[0];
        if (!inCourse) {
          confirmingInvitation = true;
        } else {
          this.props.inviteToRoom(resourceId, id, username, {});
        }
      } else {
        this.props.inviteToRoom(resourceId, id, username);
      }
    }
    // Remove the invited member from the search results
    let updatedResults = this.state.searchResults.filter(
      user => user._id !== id
    );
    this.setState({
      confirmingInvitation,
      searchResults: updatedResults,
      username: confirmingInvitation ? username : null,
      userId: confirmingInvitation ? id : null
    });
  };

  confirmInvitation = () => {
    let { parentResource, resourceId } = this.props;
    let { userId, username } = this.state;
    this.props.inviteToCourse(parentResource, userId, username, {
      guest: true
    });
    this.props.inviteToRoom(resourceId, userId, username, {});
    this.setState({
      confirmingInvitation: false,
      username: null,
      userId: null
    });
  };

  removeMember = info => {
    let { resourceId, resourceType } = this.props;
    if (resourceType === "course") {
      this.props.removeCourseMember(resourceId, info.user._id);
    } else this.props.removeRoomMember(resourceId, info.user._id);
  };

  changeRole = info => {
    let { classList, resourceId, resourceType } = this.props;
    let updatedMembers = classList.map(member => {
      return member.user._id === info.user._id
        ? { role: info.role, user: info.user._id }
        : { role: member.role, user: member.user._id };
    });
    if (resourceType === "course") {
      this.props.updateCourseMembers(resourceId, updatedMembers);
    } else this.props.updateRoomMembers(resourceId, updatedMembers);
  };

  // Consider finding a way to NOT duplicate this in MakeRooms
  search = text => {
    if (text.length > 0) {
      API.search(
        "user",
        text,
        this.props.classList.map(member => member.user._id)
      )
        .then(res => {
          let searchResults = res.data.results;
          this.setState({ searchResults, searchText: text });
        })
        .catch(err => {
          console.log("err: ", err);
        });
    } else {
      this.setState({ searchResults: [], searchText: text });
    }
  };

  render() {
    let {
      classList,
      notifications,
      owner,
      resourceType,
      courseMembers
    } = this.props;
    let joinRequests = <p>There are no new requests to join</p>;
    if (this.props.owner && notifications.length >= 1) {
      joinRequests = notifications
        .filter(ntf => ntf.notificationType === "requestAccess")
        .map((ntf, i) => {
          return (
            <Member
              grantAccess={() => {
                this.props.grantAccess(
                  ntf.fromUser._id,
                  this.props.resourceType,
                  this.props.resourceId,
                  ntf._id,
                  ntf.toUser
                );
              }}
              info={ntf.fromUser}
              key={i}
            />
          );
        });
    }
    let filteredClassList = [];
    let guestList = [];
    // console.log("Class list: ", classList);
    classList.forEach(member => {
      // console.log(member);
      if (member.role === "guest") {
        guestList.push(member);
      } else {
        filteredClassList.push(member);
      }
    });
    let classListComponents = filteredClassList.map((member, i) => {
      // at least sometimes member is just user object so there is no member.user property /// <-- well thats not good, how did that happen? this hsould be consistant
      let userId = member.user ? member.user._id : member._id;
      // checking for notification...newMember type indicates this user has added themself by entering the entryCode
      let notification = notifications.filter(ntf => {
        if (ntf.fromUser && ntf.notificationType === "newMember") {
          return ntf.fromUser._id === userId;
        } else return false;
      });
      return owner ? (
        <Member
          changeRole={this.changeRole}
          removeMember={this.removeMember}
          info={member}
          key={i}
          resourceName={resourceType}
          notification={notification.length > 0}
          owner
        />
      ) : (
        <Member info={member} key={i} />
      );
    });

    let guestListComponents = guestList.map((member, i) => {
      return owner ? (
        <Member
          changeRole={this.changeRole}
          removeMember={this.removeMember}
          info={member}
          key={i}
          resourceName={resourceType}
          owner
        />
      ) : (
        <Member info={member} key={i} />
      );
    });
    return (
      <div className={classes.Container}>
        {
          <Modal
            show={this.state.confirmingInvitation}
            closeModal={() => this.setState({ confirmingInvitation: false })}
          >
            <div>
              {this.state.username} is not in this course...you can still add
              them to this room and they will be added to the course as a guest
            </div>
            <div>
              <Button m={5} click={this.confirmInvitation}>
                Add To Room
              </Button>
              <Button
                theme={"Cancel"}
                m={5}
                click={() => {
                  this.setState({ confirmingInvitation: false });
                }}
              >
                Cancel
              </Button>
            </div>
          </Modal>
        }
        <div>
          {owner ? (
            <Fragment>
              <h3 className={classes.SubHeader}>New Requests to Join</h3>
              <div
                className={classes.Notifications}
                data-testid="join-requests"
              >
                {joinRequests}
              </div>
            </Fragment>
          ) : null}
          <h3 className={classes.SubHeader}>Class List</h3>
          <div data-testid="members">{classListComponents}</div>
          <h3 className={classes.SubHeader}>Guest List</h3>
          <div data-testid="members">{guestListComponents}</div>
          {owner ? (
            <Fragment>
              <h3 className={classes.SubHeader}>Add New Participants</h3>
              <Search
                data-testid="member-search"
                _search={this.search}
                placeholder="search by username or email address"
              />
              {this.state.searchResults.length > 0 ? (
                <SearchResults
                  searchText={this.state.searchText}
                  usersSearched={this.state.searchResults}
                  inviteMember={this.inviteMember}
                />
              ) : null}
              {resourceType === "room" && courseMembers ? (
                <div>Add participants from this course</div>
              ) : null}
            </Fragment>
          ) : null}
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, ownProps) => {
  // STart the search results populated with people already in the store
  let usersToExclude = ownProps.classList.map(member => member.user._id);
  let allUsers = getAllUsersInStore(state, usersToExclude);
  let userIds = [...allUsers.userIds].slice(0, 5);
  let usernames = [...allUsers.usernames].slice(0, 5);
  return {
    searchedUsers: userIds.map((id, i) => ({ _id: id, username: usernames[i] }))
  };
};

export default connect(
  mapStateToProps,
  {
    grantAccess,
    updateCourseMembers,
    updateRoomMembers,
    inviteToCourse,
    inviteToRoom,
    clearNotification,
    removeRoomMember,
    removeCourseMember
  }
)(Members);
