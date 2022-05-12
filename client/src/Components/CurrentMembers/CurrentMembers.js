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
  showTitle,
}) {
  const [presentMembers, setPresentMembers] = useState([]);
  const [activeUser, setActiveUser] = useState('(no one)');
  const activeMembers = React.useRef([]);

  // allow for there to be more than one active member
  React.useEffect(() => {
    if (Array.isArray(activeMember)) activeMembers.current = activeMember;
    else if (!activeMember) activeMembers.current = [];
    else activeMembers.current = [activeMember];
    let activeMemberDisplay = '(no one)';
    presentMembers.forEach((presMember) => {
      if (
        activeMembers.current &&
        activeMembers.current.includes(presMember.user._id)
      ) {
        activeMemberDisplay = usernameGen(presMember.user.username);
      }
    });
    setActiveUser(activeMemberDisplay);
  }, [activeMember]);

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
      {showTitle && (
        <div
          className={classes.Title}
          onClick={_toggle}
          onKeyPress={_toggle}
          role="button"
          tabIndex="-1"
        >
          <div className={classes.RoomDetail}>
            <p className={classes.RoomDetailText}>In control:</p>
            <p className={classes.RoomDetailValue}>{activeUser}</p>
          </div>
          <div className={classes.RoomDetail}>
            <p className={classes.RoomDetailText}>Currently in this room</p>
            <p className={classes.RoomDetailValue}>
              {presentMembers.length} /{members.length}
            </p>
          </div>
        </div>
      )}
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
                  activeMembers.current &&
                  activeMembers.current.includes(presMember.user._id)
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
  activeMember: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  expanded: PropTypes.bool.isRequired,
  showTitle: PropTypes.bool,
  toggleExpansion: PropTypes.func,
};

CurrentMembers.defaultProps = {
  activeMember: null,
  toggleExpansion: null,
  showTitle: true,
};

export default CurrentMembers;
