// PROPS:
  // tabs:  [String]
  // content: jsx || String (if no content)
  // activeTab: String
  // crumbs: [{name: String, notifications: Number}]
//
import React from 'react';
import classes from './dashboard.css';
import TabList from '../../Components/Navigation/TabList/TabList';
import BreadCrumbs from '../../Components/Navigation/BreadCrumbs/BreadCrumbs';
import DashboardContent from './DashboardContent/DashboardContent';
const dashboard = props => {
  console.log(props.resourceList)
  console.log('re rendering dashboard layout')
  return (
    <section className={classes.Container}>
      <div className={classes.BreadCrumbs}>
        <BreadCrumbs crumbs={props.crumbs}/>
      </div>
      <div className={classes.Main}>
        <div className={classes.SidePanel}>
          <div className={classes.Image}>Image</div>
          {/* <div className={classes.SpTitle}>{props.sidePanelTitle}</div> */}
        </div>
        <div className={classes.Content}>
          <TabList tabs={props.tabs} activeTab={props.activeTab} activateTab={props.activateTab}/>
          <div className={classes.MainContent}>
            <DashboardContent resourceList={props.resourceList} resource={props.resource}/>
          </div>
        </div>
      </div>
    </section>
  )
}

export default dashboard;
