import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// import moment from 'moment';
import * as d3 from 'd3';
import processData from './proccessData';
import Axis from './Axis';
import classes from './stats.css';

const Stats = ({ data }) => {
  // set the ranges
  const graph = useRef(null);
  const x = useRef(null);
  const y = useRef(null);
  const valueLine = useRef(null);
  const [[height, width], setDimensions] = useState([null, null]);
  const [processedData, setProcessedData] = useState(null);

  const margin = { top: 30, right: 10, bottom: 20, left: 50 };

  // const [isDataProcessed, setDataProcessed] = useState(false);
  useEffect(() => {
    if (graph.current && height && width) {
      const { log } = data;
      // console.log((log[log.length - 1].timestamp - log[0].timestamp) / 1000);
      const updatedData = processData(log, { timeScale: 10, byUser: false }); // 10s
      x.current = d3.scaleLinear().range([0, width]);
      y.current = d3.scaleLinear().range([height, 0]);
      // const timestamps = data.log.map(d => d.timestamp);
      x.current.domain([
        0,
        (log[log.length - 1].timestamp - log[0].timestamp) / 1000,
      ]);
      y.current.domain([0, d3.max(updatedData, d => d[1])]);

      valueLine.current = d3
        .line()
        // smoothe the line
        .curve(d3.curveBasis)
        .x(d => x.current(d[0]))
        .y(d => y.current(d[1]));
      // console.log(valueLine);
      // console.log(processedData[0], processedData[processedData.length - 1]);
      updatedData.unshift([0, 0]);
      updatedData.push([
        (log[log.length - 1].timestamp - log[0].timestamp) / 1000,
        0,
      ]);
      setProcessedData(updatedData);
    }
  }, [data, height, width]);

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
  let linePath = '';
  if (valueLine.current) {
    linePath = valueLine.current(processedData);
  }
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
            <path
              className={classes.line}
              d={linePath}
              transform={`translate(${margin.left}, 0)`}
            />
            <text transform={`translate(${width / 2}, ${height + 40})`}>
              Time
            </text>
            <text
              transform={`rotate(-90) translate(${(height + 40) / -2}, 12)`}
            >
              # of events
            </text>
          </svg>
        ) : null}
      </div>
    </div>
  );
};

Stats.propTypes = {
  data: PropTypes.shape({}).isRequired,
};

export default Stats;
