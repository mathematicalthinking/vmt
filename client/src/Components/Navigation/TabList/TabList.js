import React from 'react';
import classes from './tabList.css';
const tabList = props => {
  const tabElems = props.tabs.map(tab => {
    let style = classes.Tab;
    if (tab === props.activeTab) {
      style = [classes.Tab, classes.ActiveTab].join(' ')
    }
    return (
      <div key={tab.name} id={tab.name} onClick={props.activateTab} className={style}>{tab.name}</div>
    )
  })
  return (
    <div className={classes.Tabs}>
      {tabElems}
    </div>
  )
}

export default tabList;
