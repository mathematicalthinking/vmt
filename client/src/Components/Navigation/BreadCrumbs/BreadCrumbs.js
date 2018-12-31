import React from 'react';
import classes from './breadCrumbs.css';
import glb from '../../../global.css';
import { Link } from 'react-router-dom';
const breadCrumbs = ({crumbs, notifications}) => {
  let ntf;
  if (crumbs.length > 1 && notifications.length > 0) {
    let link = crumbs[crumbs.length - 1].link
    ntf = notifications.filter(ntf => {
      console.log(link.includes(ntf.parentResource))
      if (ntf.parentResource) {
        return !link.includes(ntf.parentResource)
      } else return  !link.includes(ntf.resourceId)
    }).length
  }
  console.log("NTF: d", ntf)

  let crumbElements = crumbs.map((crumb, i) => {
    let style = classes.Crumb;
    let seperatorStyle = classes.Seperator
    if (i === crumbs.length - 1) {
      style = [classes.Crumb, classes.Active].join(' ');
      seperatorStyle = [classes.Seperator, classes.Hidden].join(' ');
    }
    return (
      <Link  key={i} className={[glb.Link, classes.CrumbContainer].join(' ')} to={crumb.link} style={{zIndex: i}}>
        <div className={style} data-testid="crumb">
          {crumb.title}
          {(crumb.title === 'My VMT' && ntf > 0) ? <div className={classes.Ntf}>{ntf}</div> : null }
        </div>
        <div className={seperatorStyle}> <i className={"fas fa-caret-right"}></i> </div>
      </Link>
    )
  })
  return (
    <div className={classes.BreadcrumbContainer}>
      {crumbElements}
    </div>
  )
}

export default breadCrumbs;
