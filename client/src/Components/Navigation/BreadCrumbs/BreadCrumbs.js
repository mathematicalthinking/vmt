import React from 'react';
import classes from './breadCrumbs.css';
import glb from '../../../global.css';
import { Link } from 'react-router-dom';
const breadCrumbs = props => {
  console.log(props.crumbs)
  const crumbs = props.crumbs.map((crumb, i)=> (
    <Link className={glb.Link} to={crumb.link}>
      <div className={classes.Crumb} style={{zIndex: -i+1}}>
        {crumb.title}
      </div>
    </Link>
  ))
  return (
    <div className={classes.CrumbContainer}>
      {crumbs}
    </div>
  )
}

export default breadCrumbs;
