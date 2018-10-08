import React from 'react';
import { connect } from 'react-redux';
import { grantAccess, updateCourseMembers, updateRoomMembers } from '../../store/actions/'
import classes from './students.css';
import Member from '../../Components/UI/Member/Member';
import DragMember from '../../Components/UI/Member/DragMember';
// import Button from '../../Components/UI/Button/Button';

// @IDEA CONSIDER RENAMING THIS COMPONENT TO MEMBERS
const students = props => {
  console.log("STUDENTS: ", props)
  const { userResources, notifications, owner, parentResourceId, parentResource} = props;

  const changeRole = (info) => {
    let updatedMembers = userResources.map(member => {
      return (member.user._id === info.user._id) ? {role: info.role, user: info.user._id} :
      {role: member.role, user: member.user._id};
    });
    if (parentResource === 'course') {
      props.changeCourseRole(parentResourceId, updatedMembers);
    } else props.changeRoomRole(parentResourceId, updatedMembers);
  }
  
  let joinRequests;
  if (props.owner) {
    joinRequests = notifications.access.map((ntf, i) => {
      return (
        <DragMember
          grantAccess={() => {props.grantAccess(ntf.user._id, props.parentResource, props.parentResourceId)}} 
          info={ntf} 
          key={i}/>
      )
    })
  }
  const classList = userResources.map((member, i) => (
      owner ? 
      <DragMember 
        changeRole={(info) => changeRole(info)}
        info={member} 
        key={i}
      /> : <Member info={member}  key={i}/>

  ))
  return (
    <div className={classes.Container}>
      {owner ?
        <div>
          <h3 className={classes.SubHeader}>New Requests to Join</h3>
          <div className={classes.Notifications}>
            {joinRequests}
          </div>
          <h3 className={classes.SubHeader}>Add New Students</h3>
        </div>
      : null }
      <h3 className={classes.SubHeader}>Class List</h3>
      {classList}
    </div>
  )
}


export default connect(null, {grantAccess, updateCourseMembers, updateRoomMembers})(students);
