import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';

class CurrentMembers extends Component {
  constructor(props) {
    super(props);

    this.state = { presentMembers: this.getPresentMembers() };
  }

  componentDidUpdate = (prevProps) => {
    const { currentMembers } = this.props;
    if (prevProps.currentMembers === currentMembers) return;
    this.setState({ presentMembers: this.getPresentMembers() });
  };

  toggleExpansion = () => {
    const { toggleExpansion } = this.props;
    if (toggleExpansion) {
      toggleExpansion('members');
    }
  };

  getPresentMembers = () => {
    const { currentMembers, members } = this.props;

    // filter out any malformed members. Of course, this has the effect of potentially not showing someone who is there.
    const currmembers = currentMembers.filter((m) => m && m._id);
    // Creatings new array of members in the room so that we have all of the member metadata (inc color)
    // note that the members array and the currentMembers array have objects of different structure.
    const presentMembers = currmembers.map((member) =>
      members.find((m) => m.user._id === member._id)
    );
    return presentMembers;
  };

  render() {
    const { activeMember, expanded } = this.props;
    const { presentMembers } = this.state;

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
