import React from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/'
import classes from './students.css';
import Member from '../../Components/UI/Member/Member';
import DragMember from '../../Components/UI/Member/DragMember';
// import Button from '../../Components/UI/Button/Button';

// @IDEA CONSIDER RENAMING THIS COMPONENT TO MEMBERS
const students = props => {

  const { userResources, notifications, owner, parentResourceId, parentResource} = props;

  const changeRole = (info) => {
    console.log(info)
    let updatedMembers = userResources.map(member => {
      console.log("LINE !&: ", info, member)
      return (member.user._id === info.user._id) ? {role: info.role, user: info.user._id} :
      {role: member.role, user: member.user._id};
    });
    console.log(updatedMembers)
    console.log(parentResourceId)
    props.changeRoomRole(parentResourceId, updatedMembers)
  }
  console.log(owner)
  let joinRequests;
  if (props.owner) {
    joinRequests = notifications.access.map((ntf, i) => {
      return (
        owner ? <DragMember changeRole={(info) => changeRole(info)} info={ntf.user} key={i}/> : <Member info={ntf.user} key={i}/>
      )
    })
  }
  const classList = userResources.map((member, i) => (
      owner ? <DragMember changeRole={(info) => changeRole(info)} info={member} key={i}/> : <Member info={member}  key={i}/>
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

const mapDispatchToProps = dispatch => {
  return {
    grantAccess: (user, resource, resourceId) => dispatch(actions.grantAccess(user, resource, resourceId)),
    changeRoomRole: (resourceId, updatedMembers) => dispatch(actions.updateRoomMembers(resourceId, updatedMembers)),
  }
}

export default connect(null, mapDispatchToProps)(students);
