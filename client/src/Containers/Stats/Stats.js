import React, {
  useEffect,
  useState,
  useReducer,
  useCallback,
  Fragment,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import { Loading, Button, ToolTip, InfoBox } from 'Components';
import { usePopulatedRoom } from 'utils/utilityHooks';
import Chart from './Chart';
import Table from './Table';
import classes from './stats.css';
import statsReducer, { initialState } from './statsReducer';
import { exportCSV } from './stats.utils';
import Filters from './Filters';

const Stats = ({ roomId }) => {
  const { isSuccess, data } = usePopulatedRoom(roomId, true);

  const populatedRoom = isSuccess ? data : { log: [], name: 'Loading...' };
  const hasLog = populatedRoom.log && populatedRoom.log.length > 0;

  const [state, dispatch] = useReducer(statsReducer, initialState);
  const [isResizing, setResizing] = useState(false);
  const debounceResize = useCallback(debounce(() => setResizing(false), 1000));
  let chart;
  const { inChartView, filteredData } = state;

  if (hasLog && !isResizing && inChartView) {
    chart = <Chart state={state} />;
  } else if (hasLog && !isResizing) {
    chart = <Table data={filteredData} />;
  } else {
    chart = <Loading isSmall />;
  }

  useEffect(() => {
    if (hasLog) dispatch({ type: 'GENERATE_DATA', data: populatedRoom.log });
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

  return hasLog ? (
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
  ) : (
    <div data-testid="no-data-message">
      This room does not have any activity yet.
    </div>
  );
};

Stats.propTypes = {
  // populatedRoom: PropTypes.shape({}).isRequired,
  roomId: PropTypes.string.isRequired,
};

export default Stats;
