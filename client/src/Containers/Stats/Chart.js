import React, { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
// import moment from 'moment';
import moment from 'moment';
import * as d3 from 'd3';
import { dateFormatMap } from './processData';
import Axis from './Axis';
import Line from './Line';
import classes from './stats.css';

const margin = { top: 10, right: 10, bottom: 40, left: 50 };

const Chart = ({ data, state }) => {
  const { lines, units, maxY, duration = 0 } = state;
  const [[height, width], setDimensions] = useState([0, 0]);
  const graph = useRef(null);
  const x = useCallback(
    d3
      .scaleLinear()
      .domain([0, duration])
      .range([0, width]),
    [duration, width]
  );
  const y = useCallback(
    d3
      .scaleLinear()
      .domain([0, maxY])
      .range([height, 0]),
    [duration, height, maxY]
  );

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

  console.log({ x, y, lines });
  console.log(lines.length > 0, x.domain().length, y.domain().length);
  return (
    <div className={classes.Container}>
      <h2>{data.name} activity</h2>
      <div className={classes.Graph} ref={graph}>
        {lines.length > 0 &&
        x.domain().length === 2 &&
        y.domain().length === 2 ? (
          <svg height="100%" width="100%" className={classes.svgContainer}>
            <Axis
              isXAxis
              scale={x}
              height={height}
              width={width}
              left={margin.left}
            />
            <Axis
              isXAxis={false}
              left={margin.left}
              scale={y}
              width={width}
              height={height}
            />
            {lines.map(line => (
              <Line
                key={line.color}
                leftMargin={margin.left}
                data={line.data}
                color={line.color}
                x={x}
                y={y}
              />
            ))}
            {/* <path
              className={classes.line}
              d={linePath}
              transform={`translate(${margin.left}, 0)`}
            /> */}
            <text transform={`translate(${width / 2}, ${height + 40})`}>
              Time ({units})
            </text>
            <text
              transform={`rotate(-90) translate(${(height + 40) / -2}, 12)`}
            >
              # of events
            </text>
            <text transform={`translate(${0}, ${height + 40})`}>
              {data.log
                ? moment(data.log[0].timestamp).format(dateFormatMap[units])
                : null}
            </text>
            <text transform={`translate(${width - 40}, ${height + 40})`}>
              {data.log
                ? moment(data.log[data.log.length - 1].timestamp).format(
                    dateFormatMap[units]
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
  state: PropTypes.shape({}).isRequired,
};

export default Chart;
