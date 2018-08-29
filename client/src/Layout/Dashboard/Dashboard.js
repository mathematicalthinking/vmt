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
import DnDTrash from '../../Containers/DnDTrash/DnDTrash';
const dashboard = props => {
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
          <div className={classes.Tabs}>
            <TabList routingInfo={props.routingInfo} tabs={props.tabs} />
          </div>
          <div className={classes.MainContent}>
            <DnDTrash>
              {props.content}
            </DnDTrash>
          </div>
        </div>
      </div>
    </section>
  )
}

export default dashboard;
