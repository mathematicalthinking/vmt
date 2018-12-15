import React from 'react';
import classes from './dashboard.css';
import Resources from './Resources/Resources';
import Members from '../../Containers/Members/Members'
import CustomLink from '../../Components/Navigation/CustomLink/CustomLink';
import { TabList, BreadCrumbs, Avatar, Button,   } from '../../Components';
import Summary from './MainContent/RoomDetails';
import ActivityDetails from './ActivityDetails/ActivityDetails';

const dashboard = ({ sidePanel, mainContent, breadCrumbs, tabs }) => {
  
  // let {resource, parentResource, activity, course, room, user, owner} = contentData;
  let content;
  // if (parentResource === 'activities' && resource === 'details') {
  //   content = <ActivityDetails 
  //     activity={activity} 
  //     course={course} 
  //     userId={user._id}
  //     owner={owner}
  //     editing={editing} 
  //     toggleEdit={toggleEdit}
  //     update={update}
  //   />
  // } else if (resource === 'details') {
  //   content = <Summary 
  //     room={room} 
  //     loading={props.loading} 
  //     owner={owner} 
  //     toggleEdit={toggleEdit} 
  //     update={update} 
  //     editing={editing}
  //   />
  // } else {
  //   content = resource === 'members' 
  //     ? <Members {...props.contentData}/>
  //     : <Resources {...props.contentData} /> 
  // }
  // let image = sidePanelData.image ? <img src={sidePanelData.image} alt='sidePanelImage'/> :  <Avatar size='large'/>
  // let { additional } = sidePanelData.details;
  // let additionalDetails = Object.keys(additional).map((detail, i) => (
  //   <div key={i} className={classes.Detail}>{detail}: <span className={classes.DetailInfo}>{additional[detail]}</span></div>
  // ))
  return (
    <section className={classes.Container}>
      <div className={classes.BreadCrumbs}>{breadCrumbs}</div>
      <div className={classes.Main}>
        <div className={classes.SidePanel}>{sidePanel}</div>
        <div className={classes.Content}>
          <div className={classes.Tabs}>{tabs}</div>
          <div className={classes.MainContent}>{mainContent}</div>
        </div>
      </div>
    </section>
  )
}

export default (dashboard);
