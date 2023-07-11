import React from 'react';
import PropTypes from 'prop-types';
import CurrentMembers from './CurrentMembers';

const DisplayTabsCM = (props) => {
  const { tabs, currentMembers, ...others } = props;

  const updatedCurrentMembers = currentMembers.map((mem) => {
    let tabNum = tabs.findIndex((t) => {
      return t._id === mem.tab;
    });
    // assume that if someone isn't listed, they are on the first tab
    if (tabNum === -1) tabNum = 0;
    return { ...mem, tabNum: `${tabNum + 1}` };

    //
  });

  return <CurrentMembers currentMembers={updatedCurrentMembers} {...others} />;
};

DisplayTabsCM.propTypes = {
  currentMembers: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.shape({}), PropTypes.string])
  ).isRequired,
  tabs: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.shape({})),
    PropTypes.string,
  ]).isRequired,
};

export default DisplayTabsCM;
