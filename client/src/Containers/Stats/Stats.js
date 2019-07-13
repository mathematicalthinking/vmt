import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
// import classes from './stats.css';
import filterReducer from './filterReducer';
import Filters from './Filters';

const initialState = {
  byUser: false,
  byEvent: false,
  users: [],
  events: [],
};
const Stats = ({ data, populateRoom }) => {
  const [state, dispatch] = useReducer(filterReducer, initialState);

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
  }, [data.log]);

  return (
    <div>
      {chart}
      <Filters data={data} filters={state} dispatch={dispatch} />
    </div>
  );
};

Stats.propTypes = {
  data: PropTypes.shape({}).isRequired,
  populateRoom: PropTypes.func.isRequired,
};

export default Stats;
