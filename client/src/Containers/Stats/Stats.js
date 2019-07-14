import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
// import classes from './stats.css';
import statsReducer from './statsReducer';
import Filters from './Filters';

const initialState = {
  byUser: false,
  byEvent: false,
  users: [],
  events: [],
  lines: [],
  timeScale: null,
  min: 0,
  maxY: 0,
  units: '',
};

const Stats = ({ data, populateRoom }) => {
  const [state, dispatch] = useReducer(statsReducer, initialState);

  let chart;
  if (data.log) {
    chart = <Chart data={data} state={state} />;
  } else {
    chart = 'loading';
  }

  useEffect(() => {
    if (!data.log) {
      populateRoom(data._id, { events: true });
    } else {
      dispatch({ type: 'GENERATE_DATA', data: data.log });
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
