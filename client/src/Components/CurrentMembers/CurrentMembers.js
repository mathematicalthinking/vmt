import React, { Component } from 'react';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';
class CurrentMembers extends Component {
  // state = {
  //   expanded: true
  // }
  shouldComponentUpdate(nextProps) {
    if (
      nextProps.currentMembers !== this.props.currentMembers ||
      nextProps.activeMember !== this.props.activeMember
    ) {
      return true;
    }
    return false;
  }

  toggleExpansion = () => {
    this.props.toggleExpansion('members');
  };

  render() {
    let member;
    const { currentMembers, members, activeMember } = this.props;
    return (
      <div className={classes.Container}>
        <div className={classes.Title} onClick={this.toggleExpansion}>
          Currently in this room
          <div className={classes.Count}>{currentMembers.length}</div>
        </div>
        <div
          className={this.props.expanded ? classes.Expanded : classes.Collapsed}
          data-testid="current-members"
        >
          {currentMembers.map(user => {
            // get the users color
            let member = members.filter(
              member => member.user._id === user._id
            )[0];
            if (member) {
              return (
                <div
                  className={[
                    classes.Avatar,
                    user._id === activeMember
                      ? classes.Active
                      : classes.Passive,
                  ].join(' ')}
                  key={user.username}
                >
                  <Avatar username={user.username} color={member.color} />
                </div>
              );
            } else {
              console.log('key: ', user.username);
              return (
                <div
                  key={user.username}
                  className={[
                    classes.Avatar,
                    user._id === activeMember
                      ? classes.Active
                      : classes.Passive,
                  ].join(' ')}
                >
                  <Avatar
                    username={`${user.username} (admin)`}
                    color="#ffd549"
                  />
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  }
}

export default CurrentMembers;
