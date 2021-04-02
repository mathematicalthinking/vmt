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

    const presentMembers = members.filter((m) => {
      if (currentMembers.length > 0 && currentMembers[0] !== undefined) {
        const memId = currentMembers.map((cm) => cm._id);
        return memId.indexOf(m.user._id) !== -1;
      }
      return [];
    });

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
          {presentMembers.map((PM) => {
            return (
              <div
                className={[
                  classes.Avatar,
                  activeMember && PM.user._id === activeMember._id
                    ? classes.Active
                    : classes.Passive,
                ].join(' ')}
                key={PM._id}
              >
                <Avatar username={PM.user.username} color={PM.color} />
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
