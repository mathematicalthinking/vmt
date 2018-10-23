// @IDEA CONSIDER RENAMING THIS COMPONENT TO MEMBERS
// ALSO CONSIDER MOVING GRANTACCESS() FROM COURSE CONTAINER TO HERE
// EXTRACT OUT THE LAYOUT PORTION INTO THE LAYYOUT FOLDER
import React, {Component } from 'react';
import { connect } from 'react-redux';
import { 
  grantAccess, 
  updateCourseMembers, 
  updateRoomMembers, 
  clearNotification 
} from '../../store/actions'
import classes from './members.css';
import Member from '../../Components/UI/Member/Member';
// import Button from '../../Components/UI/Button/Button';

class Members extends Component {
  
  componentWillUnmount(){
    const {user, parentResource, notifications } = this.props
    if (notifications.length > 0){
      notifications.forEach(ntf => {
        if (ntf.notificationType === 'newMember') {
          this.props.clearNotification(ntf._id, user._id, parentResource, 'access',)
        }
      })
    }
  }

  changeRole = (info) => {
    console.log("CHANGING ROLE? ")
    let { userResources, parentResource, parentResourceId } = this.props;
    let updatedMembers = userResources.map(member => {
      return (member.user._id === info.user._id) ? {role: info.role, user: info.user._id} :
      {role: member.role, user: member.user._id};
    })
    if (parentResource === 'courses') {
      console.log("UPDSTED MEMBERS: ", updatedMembers)
      this.props.updateCourseMembers(parentResourceId, updatedMembers);
    } else this.props.updateRoomMembers(parentResourceId, updatedMembers);
  }

  render(){
    let { userResources, notifications, owner, parentResource  } = this.props;
    let joinRequests = "There are no current requests";
    if (this.props.owner) {
      joinRequests = notifications.filter(ntf => ntf.notificationType === 'requestAccess').map((ntf, i) => {
        return (
          <Member
            grantAccess={() => {this.props.grantAccess(ntf.user._id, this.props.parentResource, this.props.parentResourceId)}} 
            info={ntf} 
            key={i}
          />
        )
      })
    }
    let classList = userResources.map((member, i) => {
      let notification = notifications.filter(ntf => {
        if (ntf.user && ntf.notificationType === 'newMember') {
          return ntf.user._id === member.user._id
        }
        else return false;
      })
      return owner ? 
      <Member 
        changeRole={(info) => this.changeRole(info)}
        info={member} 
        key={i}
        resourceName={parentResource.slice(0, parentResource.length - 1)}
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
          </div>
        : null }
        <h3 className={classes.SubHeader}>Class List</h3>
        <div data-testid='members'>
          {classList}
        </div>
      </div>
    )

  }
}


export default connect(null, {grantAccess, updateCourseMembers, updateRoomMembers, clearNotification})(Members);
