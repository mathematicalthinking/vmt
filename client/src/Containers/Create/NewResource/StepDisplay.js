import React from 'react';
import classes from './stepDisplay.css';

const StepDisplay = React.memo((props) => {
  return <ul className={classes.progressbar}>{props.step}</ul>;
});

export default StepDisplay;
