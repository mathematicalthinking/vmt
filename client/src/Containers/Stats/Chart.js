import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// import moment from 'moment';
import moment from 'moment';
import * as d3 from 'd3';
import { processData, dateFormatMap } from './proccessData';
import Axis from './Axis';
import Line from './Line';
import classes from './stats.css';

const margin = { top: 10, right: 10, bottom: 40, left: 50 };

const Chart = ({ data, filters }) => {
  const color = 'red';
  const graph = useRef(null);
  const x = useRef(null);
  const y = useRef(null);
  const valueLine = useRef(null);
  const [[height, width], setDimensions] = useState([null, null]);
  const [[processedData, timeUnits], setProcessedData] = useState([null, '']);

  const { users, events } = filters;

  useEffect(() => {
    if (graph.current && height && width) {
      const { log } = data;
      const { lines, timeScale, units } = processData(log, {
        users,
        events,
      });
      // lines.forEach(({ data: lineData, color }) => {
      //   console.log(lineData, color);
      // });
      x.current = d3.scaleLinear().range([0, width]);
      y.current = d3.scaleLinear().range([height, 0]);
      const durationS =
        (log[log.length - 1].timestamp - log[0].timestamp) / 1000;
      const adjDuration = durationS / timeScale;

      x.current.domain([0, adjDuration]);
      y.current.domain([0, d3.max(lines[0].data, d => d[1])]);

      valueLine.current = d3
        .line()
        .curve(d3.curveMonotoneX)
        // .curve(d3.curveBasis)
        .x(d => x.current(d[0]))
        .y(d => y.current(d[1]));
      setProcessedData([lines[0].data, units]);
    }
  }, [data, height, width, users, events]);

  useEffect(() => {
    if (graph.current) {
      const {
        width: updatedWidth,
        height: updatedHeight,
      } = graph.current.getBoundingClientRect();
      setDimensions([
        updatedHeight - margin.top - margin.bottom,
        updatedWidth - margin.left - margin.right,
      ]);
    }
  }, []);

  // let linePath = '';
  // if (valueLine.current) {
  //   linePath = valueLine.current(processedData);
  // }
  // console.log({ processedData });
  // console.log(linePath);
  return (
    <div className={classes.Container}>
      <h2>{data.name} activity</h2>
      <div className={classes.Graph} ref={graph}>
        {processedData ? (
          <svg height="100%" width="100%" className={classes.svgContainer}>
            <Axis
              isXAxis
              scale={x.current}
              height={height}
              width={width}
              left={margin.left}
            />
            <Axis
              isXAxis={false}
              left={margin.left}
              scale={y.current}
              width={width}
              height={height}
            />
            <Line
              leftMargin={margin.left}
              data={processedData}
              color={color}
              x={x.current}
              y={y.current}
            />
            {/* <path
              className={classes.line}
              d={linePath}
              transform={`translate(${margin.left}, 0)`}
            /> */}
            <text transform={`translate(${width / 2}, ${height + 40})`}>
              Time ({timeUnits})
            </text>
            <text
              transform={`rotate(-90) translate(${(height + 40) / -2}, 12)`}
            >
              # of events
            </text>
            <text transform={`translate(${0}, ${height + 40})`}>
              {data.log
                ? moment(data.log[0].timestamp).format(dateFormatMap[timeUnits])
                : null}
            </text>
            <text transform={`translate(${width - 40}, ${height + 40})`}>
              {data.log
                ? moment(data.log[data.log.length - 1].timestamp).format(
                    dateFormatMap[timeUnits]
                  )
                : null}
            </text>
          </svg>
        ) : null}
      </div>
    </div>
  );
};

Chart.propTypes = {
  data: PropTypes.shape({}).isRequired,
  filters: PropTypes.shape({}).isRequired,
};

export default Chart;
