import React, { Component } from "react";
import classes from "./currentMembers.css";
import Avatar from "../UI/Avatar/Avatar";
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
    this.props.toggleExpansion("members");
  };

  render() {
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
          {members
            ? currentMembers.map(user => {
                // get the users color
                let color = members.filter(
                  member => member.user._id === user._id
                )[0].color;
                return (
                  <div
                    className={[
                      classes.Avatar,
                      user._id === activeMember
                        ? classes.Active
                        : classes.Passive
                    ].join(" ")}
                    key={user.username}
                  >
                    <Avatar username={user.username} color={color} />
                  </div>
                );
              })
            : null}
        </div>
      </div>
    );
  }
}

export default CurrentMembers;
