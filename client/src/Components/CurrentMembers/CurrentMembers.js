import React, { Component } from 'react';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';
class CurrentMembers extends Component {
  state = {
    expanded: true
  }

  toggleCollapse = () => {
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    const { members, activeMember } = this.props;
    console.log("<E<BERS: ", members)
    return (
      <div className={classes.Container}>
        <div className={classes.Title} onClick={this.toggleCollapse}>
          Members Currently in the Room
          <div className={classes.Count}>
            {members.length}
          </div>
        </div>
        <div className={(this.state.expanded ? classes.Expanded : classes.Collapsed)} data-testid='current-members'>
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
