// PROPS:
  // tabs:  list of strings
  // content: jsx
  // activeTab: string
//
import React from 'react';
import classes from './main.css';
const main = props => {
  const tabElems = props.tabs.map(tab => {
    let style = classes.Tab;
    if (tab === props.activeTab) {
      style = [classes.Tab, classes.ActiveTab].join(' ')
    }
    return (
      <div key={tab} id={tab} onClick={props.activateTab} className={style}>{tab}</div>
    )
  })
  return (
    <section className={classes.Container}>
      <section className={classes.SidePanel}>
        <div className={classes.Image}>Image</div>

      </section>
      <section className={classes.Main}>
        <div className={classes.Tabs}>
          {tabElems}
        </div>
        <div className={classes.MainContent}>
          {props.content}
        </div>
      </section>
    </section>
  )
}

export default main;
