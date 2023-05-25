import React from 'react';
import PropTypes from 'prop-types';
import CurrentMembers from './CurrentMembers';

const DisplayTabsCM = (props) => {
  const { tabs, currentMembers, ...others } = props;

  const updatedCurrentMembers = currentMembers.map((user) => {
    console.group('DisplayTabsCM');
    console.log(user);
    console.log(tabs.map((t) => t.currentMembers));
    let tabNum = tabs.findIndex((t) => {
      console.log(t.currentMembers, user._id);
      return t.currentMembers.includes(user._id);
    });
    // assume that if someone isn't listed, they are on the first tab
    if (tabNum === -1) tabNum = 0;
    console.log(`tabNum: ${tabNum}`)
    console.groupEnd()
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

export default DisplayTabsCM;
