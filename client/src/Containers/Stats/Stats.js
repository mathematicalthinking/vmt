import React, { useEffect, useState, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import Chart from './Chart';
// import classes from './stats.css';
import statsReducer, { initialState } from './statsReducer';
import Filters from './Filters';
import Loading from '../../Components/Loading/Loading';
import InfoBox from '../../Components/InfoBox/InfoBox';

const Stats = ({ data, populateRoom }) => {
  const [state, dispatch] = useReducer(statsReducer, initialState);
  const [isResizing, setResizing] = useState(false);
  const debounceResize = useCallback(debounce(() => setResizing(false), 1000));
  let chart;
  if (data.log && !isResizing) {
    chart = <Chart state={state} />;
  } else {
    chart = <Loading isSmall />;
  }

  useEffect(() => {
    if (!data.log) {
      populateRoom(data._id, { events: true });
    } else {
      dispatch({ type: 'GENERATE_DATA', data: data.log });
    }
  }, [data.log]);

  // resize
  useEffect(() => {
    const handleResize = () => {
      setResizing(true);
      debounceResize();
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });

  return (
    <div>
      <InfoBox
        title={`${data.name} activity`}
        icon={<i className="fas fa-chart-line" />}
      >
        <div
          style={{
            minHeight: 400,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {chart}
        </div>
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
