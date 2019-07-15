import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const Axis = ({ isXAxis, scale, height, width, left }) => {
  const axisRef = useRef(null);
  useEffect(() => {
    if (axisRef.current && scale) {
      const axis = isXAxis
        ? d3.axisBottom(scale)
        : // .tickValues([0, 1, 2, 3])
          d3.axisLeft(scale);
      d3.select(axisRef.current).call(axis);
      // console.log(axis.current.ticks());
    }
  });
  return (
    <g
      ref={axisRef}
      transform={`translate(${left}, ${isXAxis ? height : 0})`}
      width={width}
      height={300}
      //   style={{ border: '1px solid green' }}
    />
  );
};

Axis.propTypes = {
  isXAxis: PropTypes.bool.isRequired,
  scale: PropTypes.func.isRequired,
  height: PropTypes.number,
  width: PropTypes.number,
  left: PropTypes.number,
};

Axis.defaultProps = {
  height: 0,
  width: 0,
  left: 0,
};

export default Axis;
