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
  console.log(props.resource)
  console.log('re rendering dashboard layout')
  return (
    <section className={classes.Container}>
      <div className={classes.BreadCrumbs}>
        {props.loaded ? <BreadCrumbs crumbs={props.crumbs}/> : null}
        {/* @TODO Would bne cool to have a blank element here as a placeholder */}
      </div>
      <div className={classes.Main}>
        <div className={classes.SidePanel}>
          <div className={classes.Image}>Image</div>
          {/* <div className={classes.SpTitle}>{props.sidePanelTitle}</div> */}
        </div>
        <div className={classes.Content}>
          <TabList tabs={props.tabs} activeTab={props.resource}/>
          <div className={classes.MainContent}>
            {/* We might even consider checking this loaded in the DashboardContent so we can reveal things as the load across the dashboard instead of all at once  */}
            {props.loaded ? <DashboardContent resourceList={props.resourceList} resource={props.resource}/> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export default dashboard;
