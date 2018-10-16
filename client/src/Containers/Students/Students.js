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
} from '../../store/actions/'
import classes from './students.css';
import Member from '../../Components/UI/Member/Member';
import DragMember from '../../Components/UI/Member/DragMember';
// import Button from '../../Components/UI/Button/Button';

class Students extends Component {
  
  componentWillUnmount(){
    const {user, parentResource, notifications } = this.props
    console.log(parentResource)
    if (notifications.length > 0){
      notifications.forEach(ntf => {
        if (ntf.notificationType === 'newMember') {
          console.log("UNMOUNTING: ",ntf)
          this.props.clearNotification(ntf._id, user._id, parentResource, 'access',)
        }
      })
    }
  }

  changeRole = (info) => {
    let { userResources, parentResource, parentResourceId } = this.props;
    let updatedMembers = userResources.map(member => {
      return (member.user._id === info.user._id) ? {role: info.role, user: info.user._id} :
      {role: member.role, user: member.user._id};
    });
    if (parentResource === 'course') {
      this.this.props.changeCourseRole(parentResourceId, updatedMembers);
    } else this.this.props.changeRoomRole(parentResourceId, updatedMembers);
  }

  render(){
    let { userResources, notifications, owner,  } = this.props;
    let joinRequests = "There are no current requests";
    if (this.props.owner) {
      joinRequests = notifications.filter(ntf => ntf.notificationType === 'requestAccess').map((ntf, i) => {
        console.log(ntf)
        return (
          <DragMember
            grantAccess={() => {this.props.grantAccess(ntf.user._id, this.props.parentResource, this.props.parentResourceId)}} 
            info={ntf} 
            key={i}
          />
        )
      })
    }
    console.log("NOTIFICATIONS IN STUDENTS: ", notifications)
    let classList = userResources.map((member, i) => {
      let notification = notifications.filter(ntf => {
        if (ntf.user && ntf.notificationType === 'newMember') {
          return ntf.user._id === member.user._id
        }
        else return false;
      })
      console.log(notification, member.user._id)
      return owner ? 
      <DragMember 
        changeRole={(info) => this.changeRole(info)}
        info={member} 
        key={i}
        notification={notification.length > 0}
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
            <h3 className={classes.SubHeader}>Add New Students</h3>
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


export default connect(null, {grantAccess, updateCourseMembers, updateRoomMembers, clearNotification})(Students);
