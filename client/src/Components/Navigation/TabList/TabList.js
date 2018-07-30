import React from 'react';
import classes from './tabList.css';
import { Link } from 'react-router-dom';
const tabList = props => {
  console.log(props)
  const { params, url } = props.routingInfo
  const tabElems = props.tabs.map(tab => {
    let style = classes.Tab;
    if (tab.name.toLowerCase() === params.resource) {
      style = [classes.Tab, classes.ActiveTab].join(' ')
    }
    let updatedUrl = url.replace(params.resource, '') + tab.name.toLowerCase();
    return (
      <Link to={updatedUrl} key={tab.name} id={tab.name} className={style}>
        {tab.name}
        {tab.notifications ? <div className={classes.Notifications}>{tab.notifications}</div> : null}
      </Link>
    )
  })
  return (
    <div className={classes.Tabs}>
      {tabElems}
    </div>
  )
  }

export default tabList;
