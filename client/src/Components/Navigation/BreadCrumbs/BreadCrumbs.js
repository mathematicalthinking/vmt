import React from 'react';
import classes from './breadCrumbs.css';
const breadCrumbs = props => {
  const crumbs = props.crumbs.map(crumb => (
    <div class={classes.Crumb}>{crumb}</div>
  ))
  return (
    <div className={classes.CrumbContainer}>
      {crumbs}
    </div>
  )
}

export default breadCrumbs;
