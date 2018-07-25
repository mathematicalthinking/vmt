import React from 'react';
import classes from './tabList.css';
const tabList = props => {
  const tabElems = props.tabs.map(tab => {
    console.log(tab)
    let style = classes.Tab;
    if (tab.name === props.activeTab) {
      style = [classes.Tab, classes.ActiveTab].join(' ')
    }
    return (
      <div key={tab.name} id={tab.name} onClick={props.activateTab} className={style}>
        {tab.name}
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
