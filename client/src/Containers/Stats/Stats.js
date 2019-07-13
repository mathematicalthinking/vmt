import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
// import populateRoom from '../../store/actions';
import Chart from './Chart';

const Stats = ({ data, populateRoom }) => {
  console.log(data.log);
  let chart;
  if (data.log) {
    chart = <Chart data={data} />;
  } else {
    chart = 'loading';
  }

  useEffect(() => {
    if (!data.log) {
      populateRoom(data._id, { events: true });
    }
  }, []);
  return chart;
};

Chart.propTypes = {
  data: PropTypes.shape({}).isRequired,
  populateRoom: PropTypes.func.isRequired,
};

export default Stats;
