// PROPS:
  // tabs:  [String]
  // content: jsx || String (if no content)
  // activeTab: String
  // crumbs: [{name: String, notifications: Number}]
//
import React from 'react';
import { connect } from 'react-redux';
import classes from './dashboard.css';
import TabList from '../../Components/Navigation/TabList/TabList';
import BreadCrumbs from '../../Components/Navigation/BreadCrumbs/BreadCrumbs';
import DnDTrash from '../../Containers/DnDTrash/DnDTrash';
import Resources from './Resources/Resources';
import Trash from '../../Components/UI/Trash/Trash';
import { removeCourse } from '../../store/actions';
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
              <Resources {...props.contentData} />
              <div className={classes.Trash}><Trash removeResource={props.removeCourse}/></div>
            </DnDTrash>
          </div>
        </div>
      </div>
    </section>
  )
}

export default connect(null, {removeCourse})(dashboard);
