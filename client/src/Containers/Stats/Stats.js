import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
// import moment from 'moment';
import * as d3 from 'd3';
import { Aux } from '../../Components';
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
      setDimensions([updatedHeight, updatedWidth]);
    }
  }, []);
  let linePath = '';
  if (valueLine.current) {
    linePath = valueLine.current(processedData);
  }
  console.log({ processedData });
  console.log(linePath);
  return (
    <div className={classes.Graph} ref={graph}>
      {processedData ? (
        <Aux>
          <svg
            height={height}
            width="100%"
            // transform="translate(10, 10)"
            style={{ border: ' 1px solid blue', padding: 10 }}
          >
            <Axis
              isXAxis
              scale={x.current}
              height={height - 30}
              width={width - 30}
            />
            <Axis
              isXAxis={false}
              scale={y.current}
              height={height - 150}
              width={width - 30}
            />
            <path
              transform={`translate(20, ${height - 20}`}
              width="100%"
              d={linePath}
              style={{ boder: '1px solid red', stroke: '#000000' }}
            />
          </svg>
        </Aux>
      ) : null}
    </div>
  );
};

Stats.propTypes = {
  data: PropTypes.shape({}).isRequired,
};

export default Stats;
