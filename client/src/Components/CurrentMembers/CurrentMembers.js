import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';

class CurrentMembers extends Component {
  // state = {
  //   expanded: true
  // }
  // shouldComponentUpdate(nextProps) {
  //   const { currentMembers, activeMember } = this.props;
  //   console.log(
  //     nextProps.currentMembers.length !== currentMembers.length ||
  //       nextProps.activeMember !== activeMember
  //   );
  //   if (
  //     nextProps.currentMembers.length !== currentMembers.length ||
  //     nextProps.activeMember !== activeMember
  //   ) {
  //     return true;
  //   }
  //   return false;
  // }

  toggleExpansion = () => {
    const { toggleExpansion } = this.props;
    if (toggleExpansion) {
      toggleExpansion('members');
    }
  };

  render() {
    const { currentMembers, members, activeMember, expanded } = this.props;

    let presentMembers = [];
    if (currentMembers.length > 0 && currentMembers[0] !== undefined) {
      const memId = currentMembers.map((cm) => cm._id);
      presentMembers = members.filter((m) => memId.indexOf(m.user._id) !== -1);
    }

    return (
      <div className={classes.Container}>
        <div
          className={classes.Title}
          onClick={this.toggleExpansion}
          onKeyPress={this.toggleExpansion}
          role="button"
          tabIndex="-1"
        >
          Currently in this room
          <div className={classes.Count}>{presentMembers.length}</div>
        </div>
        <div
          className={expanded ? classes.Expanded : classes.Collapsed}
          data-testid="current-members"
        >
          {presentMembers.map((presMember) => {
            return (
              <div
                className={[
                  classes.Avatar,
                  activeMember && presMember.user._id === activeMember
                    ? classes.Active
                    : classes.Passive,
                ].join(' ')}
                key={presMember._id}
              >
                <Avatar
                  username={presMember.user.username}
                  color={presMember.color}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

CurrentMembers.propTypes = {
  currentMembers: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
  ).isRequired,
  members: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  activeMember: PropTypes.string,
  expanded: PropTypes.bool.isRequired,
  toggleExpansion: PropTypes.func,
};

CurrentMembers.defaultProps = {
  activeMember: null,
  toggleExpansion: null,
};

export default CurrentMembers;
