import React, {
  useEffect,
  useState,
  useReducer,
  useCallback,
  Fragment,
} from 'react';
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
import ToolTip from '../../Components/ToolTip/ToolTip';
import InfoBox from '../../Components/InfoBox/InfoBox';

const Stats = ({ populatedRoom }) => {
  const [state, dispatch] = useReducer(statsReducer, initialState);
  const [isResizing, setResizing] = useState(false);
  const debounceResize = useCallback(debounce(() => setResizing(false), 1000));
  let chart;
  const { inChartView, filteredData } = state;
  if (populatedRoom.log && !isResizing && inChartView) {
    chart = <Chart state={state} />;
  } else if (populatedRoom.log && !isResizing) {
    chart = <Table data={filteredData} />;
  } else {
    chart = <Loading isSmall />;
  }

  useEffect(() => {
    dispatch({ type: 'GENERATE_DATA', data: populatedRoom.log });
  }, [populatedRoom.log]);

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
        title={`${populatedRoom.name} activity`}
        icon={
          inChartView ? (
            <i className="fas fa-chart-line" />
          ) : (
            <i className="fas fa-table" />
          )
        }
        rightIcons={
          <Fragment>
            <ToolTip text={inChartView ? 'View table' : 'View line graph'}>
              <Button
                theme="None"
                key="1"
                data-testid="toggle-chart"
                click={() => dispatch({ type: 'TOGGLE_CHART_VIEW' })}
              >
                {inChartView ? (
                  <i className="fas fa-table" />
                ) : (
                  <i className="fas fa-chart-line" />
                )}
              </Button>
            </ToolTip>
            <ToolTip text="download csv">
              <Button
                theme="None"
                key="2"
                data-testid="download-csv"
                click={() =>
                  exportCSV(filteredData, `${populatedRoom.name}_csv`)
                }
              >
                <i className="fas fa-download" />
              </Button>
            </ToolTip>
          </Fragment>
        }
      >
        <div className={classes.ChartContainer}>{chart}</div>
      </InfoBox>
      <InfoBox title="Filters" icon={<i className="fas fa-filter" />}>
        <Filters data={populatedRoom} filters={state} dispatch={dispatch} />
      </InfoBox>
    </div>
  );
};

Stats.propTypes = {
  populatedRoom: PropTypes.shape({}).isRequired,
};

export default Stats;
