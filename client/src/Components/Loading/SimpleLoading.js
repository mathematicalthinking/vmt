import React from 'react';
import classes from './loading.css';

export default function SimpleLoading() {
  return (
    <div className={classes.Pending}>
      Loading
      <span className={classes.dot1}>.</span>
      <span className={classes.dot2}>.</span>
      <span className={classes.dot3}>.</span>
    </div>
  );
}
