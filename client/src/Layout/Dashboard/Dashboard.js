// PROPS:
  // tabs:  list of strings
  // content: jsx || string (if no content)
  // activeTab: string
//
import React from 'react';
import classes from './dashboard.css';
import TabList from '../../Components/Navigation/TabList/TabList';
import BreadCrumbs from '../../Components/Navigation/BreadCrumbs/BreadCrumbs'
const dashboard = props => {
  console.log(props.crumbs)
  return (
    <section className={classes.Container}>
      <div className={classes.BreadCrumbs}>
        <BreadCrumbs crumbs={props.crumbs}/>
      </div>
      <div className={classes.Main}>
        <div className={classes.SidePanel}>
          <div className={classes.Image}>Image</div>
          <div className={classes.SpTitle}>{props.sidePanelTitle}</div>
        </div>
        <div className={classes.Content}>
          <TabList tabs={props.tabs} activeTab={props.activeTab} activateTab={props.activateTab}/>
          <div className={classes.MainContent}>
            {/* THIS IS BAD -- THIS LAYOUT SHOULDNT NEED TO KNOW WHAT THE ACTIVE TAB IS  */}
            {/* I THINK IT COULD BE EASILYU FIXED JUST PASS THE CREATE PIECE IF WE WANT IT THERE AND DONT IF WE DONT */}
            {(props.activeTab !== 'Settings') ? <div className={classes.CreateContainer}>
              {props.contentCreate}
            </div> : null}
            {props.content}
          </div>
        </div>
      </div>
    </section>
  )
}

export default dashboard;
