import React from 'react';
import PropTypes from 'prop-types';

const expandIcon = ({ clickHandler }) => {
  return (
    <svg
      style={{ zIndex: -1 }}
      onClick={clickHandler}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
    >
      <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" />
      <path d="M0 0h24v24H0z" fill="none" />
    </svg>
  );
};

expandIcon.propTypes = {
  clickHandler: PropTypes.func.isRequired,
};
export default expandIcon;
