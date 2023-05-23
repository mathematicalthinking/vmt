import React from 'react';
import PropTypes from 'prop-types';
import CurrentMembers from './CurrentMembers';

const DisplayTabsCM = (props) => {
  const { tabs, members, currentMembers, ...others } = props;

  const updatedCurrentMembers = currentMembers.map((mem) => {
    const fullMember = members.find((m) => m.user._id === mem._id);
    if (!fullMember || !fullMember.currentTab) return mem;
    const tabNum = tabs.indexOf((t) => t._id === fullMember.currentTab);
    if (tabNum === -1) return mem;
    return { ...mem, username: `${mem.username} (#${tabNum + 1})` };
  });

  return <CurrentMembers currentMembers={updatedCurrentMembers} {...others} />;
};

DisplayTabsCM.propTypes = {
  members: PropTypes.arrayOf(
    PropTypes.shape({
      user: PropTypes.shape({
        _id: PropTypes.string,
        username: PropTypes.string,
      }),
      currentTab: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string]),
    })
  ).isRequired,
  activeMember: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]),
  currentMembers: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
  ).isRequired,
  tabs: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]).isRequired,
};

DisplayTabsCM.defaultProps = {
  activeMember: [],
};
