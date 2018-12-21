import React, { Component } from 'react';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';
class CurrentMembers extends Component {

  render() {
    const { members, activeMember } = this.props;
    return (
      <div className={classes.Container}>
        <div className={classes.Title}>
          Current Members
          <div className={classes.Count}>
            {members.length}
          </div>
        </div>
        <div className={classes.Left} data-testid='current-members'>
          {members ? members.map(user =>
            <div
              className={[classes.Avatar, (user._id === activeMember ? classes.Active : classes.Passive)].join(" ")}
              key={user.username}>
              <Avatar username={user.username} />
            </div>) : null}
        </div>
      </div>
    )
  }
}

export default CurrentMembers;
