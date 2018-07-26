import React from 'react';
import classes from './students.css';
import Avatar from '../../../Components/UI/Avatar/Avatar';
import Button from '../../../Components/UI/Button/Button';

const students = props => {
  console.log(props.notifications)
  const joinRequests = props.notifications.map(ntf => (
    <div className={classes.Ntf}>
      <div style={{margin: 20}}><Avatar username={ntf.user.username} /></div>
      <div>requested access to join this course [TIMESTAMP]</div>
      <Button click={''}>Grant Access</Button>
        </div>
  ))
  console.log(joinRequests)
  return (
    <div className={classes.Container}>
      <h3>New Requests to Join</h3>
      <div className={classes.Notifications}>
        {joinRequests}
      </div>
      <h3>Add New Students</h3>
      <h3>Student List</h3>
    </div>
  )
}

export default students;
