import React from 'react';
// import { connect } from 'react-redux';
// import { fail } from '../../store/actions/loading';
import classes from './error.css';
const Error = (props) => {

  return (
    <div className={props.error ? classes.Error : null}>
      {props.children}
    </div>
  )
}

export default Error;
