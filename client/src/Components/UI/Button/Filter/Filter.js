import React from 'react';
import classes from './filter.css';
const filter = props => {
  const stateClass = props.on ? classes.Off : classes.On;
  return (
    <button className={[classes.Filter, stateClass].join(' ')} onClick={props.click}>
      <i className={['fas fa-filter', classes.Icon, stateClass].join(' ')}></i>
      {props.children}
    </button>
  )
}
export default filter;
