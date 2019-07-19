import React, { useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import Chart from './Chart';
// import classes from './stats.css';
import statsReducer, { initialState } from './statsReducer';
import Filters from './Filters';
import InfoBox from '../../Components/InfoBox/InfoBox';

const Stats = ({ data, populateRoom }) => {
  const [state, dispatch] = useReducer(statsReducer, initialState);
  let chart;
  if (data.log) {
    chart = <Chart state={state} />;
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
      <InfoBox
        title={`${data.name} activity`}
        icon={<i className="fas fa-chart-line" />}
      >
        {chart}
      </InfoBox>
      <InfoBox title="Filters" icon={<i className="fas fa-filter" />}>
        <Filters data={data} filters={state} dispatch={dispatch} />
      </InfoBox>
    </div>
  );
};

Stats.propTypes = {
  data: PropTypes.shape({}).isRequired,
  populateRoom: PropTypes.func.isRequired,
};

export default Stats;
