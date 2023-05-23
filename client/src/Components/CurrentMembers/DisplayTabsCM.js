import React from 'react';
import PropTypes from 'prop-types';
import CurrentMembers from './CurrentMembers';

const DisplayTabsCM = (props) => {
  const { tabs, currentMembers, ...others } = props;

  const updatedCurrentMembers = currentMembers.map((user) => {
    let tabNum = tabs.indexOf((t) => t.currentMembers.includes(user._id));
    // assume that if someone isn't listed, they are on the first tab
    if (tabNum === -1) tabNum = 0;
    return { ...user, username: `${user.username} (#${tabNum + 1})` };
  });

  return <CurrentMembers currentMembers={updatedCurrentMembers} {...others} />;
};

DisplayTabsCM.propTypes = {
  currentMembers: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
  ).isRequired,
  tabs: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.string),
    PropTypes.string,
  ]).isRequired,
};
