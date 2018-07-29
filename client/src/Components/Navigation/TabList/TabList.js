import React from 'react';
import classes from './tabList.css';
import glb from '../../../global.css';
import { Link } from 'react-router-dom';
const tabList = props => {
  const tabElems = props.tabs.map(tab => {
    let style = classes.Tab;
    if (tab.name.toLowerCase() === props.activeTab) {
      style = [classes.Tab, classes.ActiveTab].join(' ')
    }
    return (
      <div key={tab.name} id={tab.name} className={style}>
        <Link
          to={`/dashboard/${tab.name.toLowerCase()}`}
          className={glb.Link}
        >{tab.name}</Link>
        {tab.notifications ? <div className={classes.Notifications}>{tab.notifications}</div> : null}
      </div>
    )
  })
  return (
    <div className={classes.Tabs}>
      {tabElems}
    </div>
  )
  }

export default tabList;
