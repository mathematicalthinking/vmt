import React from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { fail } from '../../store/actions/loading';
import classes from './error.css';

const Error = props => {
  const { error, children } = props;
  return <div className={error ? classes.Error : null}>{children}</div>;
};

Error.propTypes = {
  error: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

Error.defaultProps = {
  error: false,
};

export default Error;
