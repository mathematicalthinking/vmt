import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classes from './currentMembers.css';
import Avatar from '../UI/Avatar/Avatar';
import COLOR_MAP from '../../utils/colorMap';

function CurrentMembers({
  currentMembers,
  members,
  activeMember, // either individual user id or an array of user ids.
  inControl, // the user id of the person who should be displayed in the 'in control' area
  expanded,
  toggleExpansion,
  showTitle,
}) {
  const [presentMembers, setPresentMembers] = useState([]);

  React.useEffect(() => {
    if (!currentMembers) return;
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
          tabNum: member.tabNum,
        };
        newMemCount += 1;
      }
      return {
        ...mem,
        user: { ...mem.user, username: member.username },
        tabNum: member.tabNum ? member.tabNum : '',
      };
    });
    setPresentMembers(result);
  }, [currentMembers]);

  const _toggle = () => {
    if (toggleExpansion) {
      toggleExpansion('members');
    }
  };

  const username = (id) => {
    const member = members.find((mem) => mem.user._id === id);
    return member && member.user ? shortenName(member.user.username) : '';
  };

  const shortenName = (usrnm) => {
    let shortName = usrnm;
    const maxLen = 35;
    if (shortName.includes('@'))
      shortName = shortName.substring(0, shortName.lastIndexOf('@'));
    if (shortName.length > maxLen) shortName = shortName.substring(0, maxLen);
    // ex: pug-45 (#1)
    return shortName;
  };

  const isActive = (id) => {
    // activeMember might be null, an array, or a string (id)
    if (!activeMember) return false;
    else if (typeof activeMember === 'string') return activeMember === id;
    return activeMember.includes(id);
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
            <p className={classes.RoomDetailValue}>
              {inControl ? username(inControl) : '(no one)'}
            </p>
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
            const shortName = `${shortenName(presMember.user.username)} ${
              presMember.tabNum
            }`;
            return (
              <div
                className={[
                  classes.Avatar,
                  isActive(presMember.user._id)
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
  inControl: PropTypes.string,
};

CurrentMembers.defaultProps = {
  activeMember: null,
  toggleExpansion: null,
  showTitle: true,
  inControl: null,
};

export default CurrentMembers;
