import React, { useEffect, useState, useReducer, useCallback } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import Chart from './Chart';
import Table from './Table';
import classes from './stats.css';
import statsReducer, { initialState } from './statsReducer';
import { exportCSV } from './stats.utils';
import Filters from './Filters';
import Loading from '../../Components/Loading/Loading';
import Button from '../../Components/UI/Button/Button';
import InfoBox from '../../Components/InfoBox/InfoBox';

const Stats = ({ data, populateRoom }) => {
  const [state, dispatch] = useReducer(statsReducer, initialState);
  const [isResizing, setResizing] = useState(false);
  const debounceResize = useCallback(debounce(() => setResizing(false), 1000));
  let chart;
  const { inChartView, filteredData } = state;
  if (data.log && !isResizing && inChartView) {
    chart = <Chart state={state} />;
  } else if (data.log && !isResizing) {
    chart = <Table data={filteredData} />;
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
        icon={
          inChartView ? (
            <i className="fas fa-chart-line" />
          ) : (
            <i className="fas fa-table" />
          )
        }
        rightIcons={
          <div>
            <Button
              theme="None"
              key="1"
              click={() => dispatch({ type: 'TOGGLE_CHART_VIEW' })}
            >
              {inChartView ? (
                <i className="fas fa-table" />
              ) : (
                <i className="fas fa-chart-line" />
              )}
            </Button>
            <Button
              theme="None"
              key="2"
              click={() => exportCSV(filteredData, `${data.name}_csv`)}
            >
              <i className="fas fa-download" />
            </Button>
          </div>
        }
      >
        <div className={classes.ChartContainer}>{chart}</div>
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
