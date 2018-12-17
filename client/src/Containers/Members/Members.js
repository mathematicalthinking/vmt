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
} from '../../store/actions'
import classes from './members.css';
import Member from '../../Components/UI/Member/Member';
// import Button from '../../Components/UI/Button/Button';

class Members extends Component {
  
  componentWillUnmount(){
    const {user, resourceType, notifications } = this.props;
    if (notifications.length > 0){
      notifications.forEach(ntf => {
        if (ntf.notificationType === 'newMember') {
          this.props.clearNotification(ntf._id, user._id, ntf.user._id, resourceType, 'access', ntf.notificationType)
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
    let { classList, notifications, owner, resourceType, courseMembers  } = this.props;
    let joinRequests = "There are no current requests";
    if (this.props.owner) {
      joinRequests = notifications.filter(ntf => ntf.notificationType === 'requestAccess').map((ntf, i) => {
        return (
          <Member
            grantAccess={() => {this.props.grantAccess(ntf.user._id, this.props.resourceType, this.props.resourceId)}} 
            info={ntf} 
            key={i}
          />
        )
      })
    }
    let classListComponents = classList.map((member, i) => {
      let notification = notifications.filter(ntf => {
        if (ntf.user && ntf.notificationType === 'newMember') {
          return ntf.user._id === member.user._id
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


export default connect(null, {
  grantAccess, 
  updateCourseMembers, 
  updateRoomMembers, 
  clearNotification,
  removeRoomMember,
  removeCourseMember,  
})(Members);
