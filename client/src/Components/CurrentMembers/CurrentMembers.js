import React, { Component } from 'react';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';
class CurrentMembers extends Component {
  // state = {
  //   expanded: true
  // }
  shouldComponentUpdate(nextProps) {
    if (nextProps.members !== this.props.members || nextProps.activeMember !== this.props.activeMember) {
      return true;
    }
    return false;
  }

  toggleExpansion = () => {
    this.props.toggleExpansion('members')
  }

  render() {
    console.log('members')
    const { members, activeMember } = this.props;
    return (
      <div className={classes.Container}>
        <div className={classes.Title} onClick={this.toggleExpansion}>
          Currently in this room
          <div className={classes.Count}>
            {members.length}
          </div>
        </div>
        <div className={(this.props.expanded ? classes.Expanded : classes.Collapsed)} data-testid='current-members'>
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
