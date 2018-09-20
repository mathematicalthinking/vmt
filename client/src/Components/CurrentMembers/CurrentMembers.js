import React, { Component } from 'react';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';
class CurrentMembers extends Component {

  render() {
    const { currentUsers } = this.props;
    return (
      <div className={classes.Container}>
        <h3>Current Members</h3>
        <div className={classes.Container}>{currentUsers ? currentUsers.map(user =>
          <div className={classes.Avatar} key={user.username}><Avatar username={user.username} />
          </div>) : null}
        </div>
      </div>
    )
  }
}

export default CurrentMembers;
