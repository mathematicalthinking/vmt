import React from 'react';
import classes from './breadCrumbs.css';
import glb from '../../../global.css';
import { Link } from 'react-router-dom';
const breadCrumbs = props => {
  let crumbs = props.crumbs.map((crumb, i) => {
    let style = classes.Crumb;
    let seperatorStyle = classes.Seperator
    if (i === props.crumbs.length - 1) {
      style = [classes.Crumb, classes.Active].join(' ');
      seperatorStyle = [classes.Seperator, classes.Hidden].join(' ');
    }
    return (
      <Link  key={i} className={[glb.Link, classes.CrumbContainer].join(' ')} to={crumb.link} style={{zIndex: i}}>
        <div className={style} data-testid="crumb">
          {crumb.title}
        </div>
        <div className={seperatorStyle}> <i className={"fas fa-caret-right"}></i> </div>
      </Link>
    )
  })
  return (
    <div className={classes.BreadcrumbContainer}>
      {crumbs}
    </div>
  )
}

export default breadCrumbs;
