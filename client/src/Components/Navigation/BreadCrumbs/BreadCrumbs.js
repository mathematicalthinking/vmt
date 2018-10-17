import React from 'react';
import classes from './breadCrumbs.css';
import glb from '../../../global.css';
import { Link } from 'react-router-dom';
const breadCrumbs = props => {
  let crumbs = props.crumbs.map((crumb, i) => {
    let style = classes.Crumb;
    if (i === props.crumbs.length - 1) { 
      style = [classes.Crumb, classes.Active].join(' ')
    }
    return (
      <Link  key={i} className={glb.Link} to={crumb.link} style={{zIndex: i}}>
        <div className={style} data-testid="crumb">
          {crumb.title}
        </div>
      </Link>
    )
  })
  console.log(crumbs)
  return (
    <div className={classes.CrumbContainer}>
      {crumbs}
    </div>
  )
}

export default breadCrumbs;
