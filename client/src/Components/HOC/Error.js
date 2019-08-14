import React from 'react';
import PropTypes from 'prop-types';
// import { connect } from 'react-redux';
// import { fail } from '../../store/actions/loading';
import classes from './error.css';

const ErrorComp = (props) => {
  const { error, children, fullPage } = props;
  let style = null;
  if (error) {
    style = classes.Error;
  } else if (fullPage) {
    style = classes.FullPageError;
    console.log('stylesd = full page error');
  }
  return <div className={style}>{children}</div>;
};

ErrorComp.propTypes = {
  error: PropTypes.bool,
  fullPage: PropTypes.bool,
  children: PropTypes.node.isRequired,
};

ErrorComp.defaultProps = {
  error: false,
  fullPage: false,
};

export default ErrorComp;
