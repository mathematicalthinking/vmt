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
  console.log(owner)
  let joinRequests;
  if (props.owner) {
    joinRequests = notifications.access.map((ntf, i) => {
      // console.log()
      return (
          owner ? <DragMember info={ntf.user} key={i}/> : <Member info={ntf.user} key={i}/>
          /* <div style={{margin: 20}}><Avatar username={ntf.user.username} /></div>
            <div>requested access to join this course [TIMESTAMP @TODO]</div>
          <Button click={() => props.grantAccess(ntf.user._id, parentResource.slice(0, parentResource.length - 1), parentResourceId)}>Grant Access</Button> */

      )
    })
  }
  const classList = userResources.map((member, i) => (
    // <div className={classes.UserRow} key={i}>
      owner ? <DragMember info={member} key={i}/> : <Member info={member} key={i}/>
    // </div>
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
    grantAccess: (user, resource, resourceId) => dispatch(actions.grantAccess(user, resource, resourceId))
  }
}

export default connect(null, mapDispatchToProps)(students);
