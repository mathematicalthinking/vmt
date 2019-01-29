// @IDEA CONSIDER RENAMING THIS COMPONENT TO MEMBERS
// ALSO CONSIDER MOVING GRANTACCESS() FROM COURSE CONTAINER TO HERE
// EXTRACT OUT THE LAYOUT PORTION INTO THE LAYYOUT FOLDER
import React, {Component } from 'react';
import { connect } from 'react-redux';
import {
  grantAccess,
  updateCourseMembers,
  updateRoomMembers,
  clearNotification,
  removeCourseMember,
  removeRoomMember,
} from '../../store/actions';
import { getAllUsersInStore } from '../../store/reducers/';
import {
  Member,
  Search,
  Dropdown,
} from '../../Components';
import SearchResults from './SearchResults';
import classes from './members.css';

class Members extends Component {

  state = {
    searchedUsers: this.props.allUsers || [],
  }

  componentWillUnmount(){
    const { notifications } = this.props;
    if (notifications.length > 0){
      notifications.forEach(ntf => {
        if (ntf.notificationType === 'newMember') {
          this.props.clearNotification(ntf._id);
        }
      })
    }
  }

  removeMember = (info) => {
    let {resourceId, resourceType } = this.props;
    if (resourceType === 'course') {
      this.props.removeCourseMember(resourceId, info.user._id);
    } else this.props.removeRoomMember(resourceId, info.user._id);
  }

  changeRole = (info) => {
    let { classList, resourceId, resourceType } = this.props;
    let updatedMembers = classList.map(member => {
      return (member.user._id === info.user._id) ? {role: info.role, user: info.user._id} :
      {role: member.role, user: member.user._id};
    })
    if (resourceType === 'course') {
      this.props.updateCourseMembers(resourceId, updatedMembers);
    } else this.props.updateRoomMembers(resourceId, updatedMembers);
  }

  render(){
    console.log("THIS>PROPS> ", this.props)
    let searchedUsersArr = [...this.state.searchedUsers.usernames]

    let { classList, notifications, owner, resourceType, courseMembers  } = this.props;
    let joinRequests = <p>There are no new requests to join</p>;
    if (this.props.owner && notifications.length >= 1) {
      joinRequests = notifications.filter(ntf => ntf.notificationType === 'requestAccess').map((ntf, i) => {
        return (
          <Member
            grantAccess={() => {this.props.grantAccess(ntf.fromUser._id, this.props.resourceType, this.props.resourceId, ntf._id, ntf.toUser)}}
            info={ntf.fromUser}
            key={i}
          />
        )
      })
    }
    let classListComponents = classList.map((member, i) => {
      // at least sometimes member is just user object so there is no member.user property
      let userId = member.user ? member.user._id : member._id;
      let notification = notifications.filter(ntf => {
        if (ntf.fromUser && ntf.notificationType === 'newMember') {
          return ntf.fromUser._id === userId
        }
        else return false;
      })
      return owner ?
      <Member
        changeRole={this.changeRole}
        removeMember={this.removeMember}
        info={member}
        key={i}
        resourceName={resourceType}
        notification={notification.length > 0}
        owner
      /> : <Member info={member}  key={i}/>

    })
    return (
      <div className={classes.Container}>
        {owner ?
          <div>
            <h3 className={classes.SubHeader}>New Requests to Join</h3>
            <div className={classes.Notifications} data-testid='join-requests'>
              {joinRequests}
            </div>
            <h3 className={classes.SubHeader}>Add New Participants</h3>
            <Search />
            <SearchResults usersSearched={searchedUsersArr}/>
            {resourceType === 'room' && courseMembers ?
              <div>
                Add participants from this course
              </div>: null
            }
          </div>
        : null }
        <h3 className={classes.SubHeader}>Class List</h3>
        <div data-testid='members'>
          {classListComponents}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  let usersToExclude = ownProps.classList.map(member => member.user._id);
  return {allUsers: getAllUsersInStore(state, usersToExclude),}
};

export default connect(mapStateToProps, {
  grantAccess,
  updateCourseMembers,
  updateRoomMembers,
  clearNotification,
  removeRoomMember,
  removeCourseMember,
})(Members);
