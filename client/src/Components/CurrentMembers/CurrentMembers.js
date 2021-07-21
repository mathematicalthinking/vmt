import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';
import COLOR_MAP from '../../utils/colorMap';

function CurrentMembers({
  currentMembers,
  members,
  activeMember,
  expanded,
  toggleExpansion,
}) {
  const [presentMembers, setPresentMembers] = useState([]);

  React.useEffect(() => {
    // filter out any malformed members. Of course, this has the effect of potentially not showing someone who is there.
    const currmembers = currentMembers.filter((m) => m && m._id);
    // Creatings new array of members in the room so that we have all of the member metadata (inc color)
    // note that the members array and the currentMembers array have objects of different structure.
    // there is some additional logic if new room members are added mid-session, simply to assign them a color in the room roster
    let newMemCount = 0;
    const result = currmembers.map((member) => {
      let mem = members.find((m) => m.user._id === member._id);
      if (!mem) {
        mem = {
          user: {
            username: member.username,
            _id: member._id,
          },
          color: COLOR_MAP[members.length + newMemCount || 0],
        };
        newMemCount += 1;
      }
      return mem;
    });
    setPresentMembers(result);
  }, [currentMembers]);

  const _toggle = () => {
    if (toggleExpansion) {
      toggleExpansion('members');
    }
  };

  const usernameGen = (usrnm) => {
    let shortName = usrnm;
    const maxLen = 12;
    if (shortName.includes('@'))
      shortName = shortName.substring(0, shortName.lastIndexOf('@'));
    if (shortName.length > maxLen) shortName = shortName.substring(0, maxLen);
    return shortName;
  };

  return (
    <div className={classes.Container}>
      <div
        className={classes.Title}
        onClick={_toggle}
        onKeyPress={_toggle}
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
          if (presMember) {
            const shortName = usernameGen(presMember.user.username);
            return (
              <div
                className={[
                  classes.Avatar,
                  activeMember && presMember.user._id === activeMember
                    ? classes.Active
                    : classes.Passive,
                ].join(' ')}
                key={presMember.user._id}
              >
                <Avatar username={shortName} color={presMember.color} />
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
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
