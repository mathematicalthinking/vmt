import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import styles from './stats.css';

const Line = ({ data, color, leftMargin, x, y }) => {
  const line = d3
    .line()
    .curve(d3.curveMonotoneX)
    // .curve(d3.curveBundle.beta(1))
    .x(d => x(d[0]))
    .y(d => y(d[1]));

  const linePath = line(data);
  return (
    <path
      data-testid={`line-${color}`}
      className={styles.line}
      d={linePath}
      stroke={color}
      transform={`translate(${leftMargin}, 0)`}
    />
  );
};

Line.propTypes = {
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
  leftMargin: PropTypes.number.isRequired,
  color: PropTypes.string,
  x: PropTypes.func.isRequired,
  y: PropTypes.func.isRequired,
};

Line.defaultProps = {
  color: 'blue',
};

export default Line;
