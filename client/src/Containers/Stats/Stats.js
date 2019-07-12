import React from 'react';
import PropTypes from 'prop-types';

const Stats = ({ data }) => {
  console.log(data);
  return <div>Stats</div>;
};

Stats.propTypes = {
  data: PropTypes.shape({}).isRequired,
};

export default Stats;
