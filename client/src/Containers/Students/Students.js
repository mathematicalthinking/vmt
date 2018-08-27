import React from 'react';
import classes from './students.css';
import Avatar from '../../Components/UI/Avatar/Avatar';
import Button from '../../Components/UI/Button/Button';
import * as actions from '../../store/actions/'
import { connect } from 'react-redux';

const students = props => {
  let joinRequests;
  if (props.owner) {
    joinRequests = props.notifications.map((ntf, i) => {
      // console.log()
      return (
        <div className={classes.UserRow} key={i}>
          <div style={{margin: 20}}><Avatar username={ntf.user.username} /></div>
          <div>requested access to join this course [TIMESTAMP @TODO]</div>
          <Button click={() => props.grantAccess(ntf.user, props.resource, props.resourceId)}>Grant Access</Button>
        </div>
      )
    })
  }
  const classList = props.classList.map((member, i) => (
    <div className={classes.UserRow} key={i}>
      <div style={{margin: 20}}><Avatar username={member.user.username} /></div>
      <div className={classes.Role}>{member.role}</div>
    </div>
  ))
  return (
    <div className={classes.Container}>
      {props.owner ?
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
