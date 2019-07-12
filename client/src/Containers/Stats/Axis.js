import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

const Axis = ({ isXAxis, scale, height, width }) => {
  const axis = useRef(null);
  useEffect(() => {
    if (axis.current && scale) {
      d3.select(axis.current).call(
        isXAxis ? d3.axisBottom(scale) : d3.axisLeft(scale)
      );
    }
  });
  return (
    <g
      ref={axis}
      transform={
        isXAxis ? `translate(20, ${height - 20})` : 'translate(20, -50)'
      }
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
};

Axis.defaultProps = {
  height: 0,
  width: 0,
};

export default Axis;
