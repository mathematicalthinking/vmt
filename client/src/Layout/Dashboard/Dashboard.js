import React from 'react';
import classes from './dashboard.css';
import TabList from '../../Components/Navigation/TabList/TabList';
import BreadCrumbs from '../../Components/Navigation/BreadCrumbs/BreadCrumbs';
import DnDTrash from '../../Components/HOC/DnDTrash';
import Resources from './Resources/Resources';
import Students from '../../Containers/Students/Students'
import Trash from '../../Components/UI/Trash/Trash';
import Avatar from '../../Components/UI/Avatar/Avatar';
import Button from '../../Components/UI/Button/Button';
import Summary from '../Room/Summary/Summary';
import MakeRoomsLayout from './MakeRooms/MakeRooms';

const dashboard = props => {
  const {contentData, sidePanelData, view, toggleView} = props;
  const {resource, parentResource, activity, course, room, userId} = contentData;
  let content;
  if (parentResource === 'activities' && resource === 'details') {
    content = <MakeRoomsLayout activity={activity} course={course} userId={userId}/>
  } else if (resource === 'summary') {
    content = <Summary room={room} loading={props.loading}/>
  } else {
    content = <DnDTrash>
      {resource === 'members' ? <Students {...props.contentData}/>
      : <Resources {...props.contentData} /> }
      <div className={classes.Trash}><Trash /></div>
    </DnDTrash>
  }

  let image = <img src={sidePanelData.image}/>
  if (!sidePanelData.image) { 
    if (sidePanelData.title === 'My VMT') {
      image = <Avatar size='large'/>
    }
  }  

  return (
    <section className={classes.Container}>
      <div className={classes.BreadCrumbs}>
        <BreadCrumbs crumbs={props.crumbs}/>
      </div>
      <div className={classes.Main}>
        <div className={classes.SidePanel}>
          <div>
            <div className={classes.Image}>{image}</div>
            <div className={classes.SpTitle}>{sidePanelData.title}</div>
            <div className={classes.Details}>
              {sidePanelData.details}
            </div>
            <div className={classes.ViewOpts}></div>
          </div>
          {props.bothRoles ? 
          <div>
            <div>view as...</div>
            <Button click={toggleView} active={view === 'teacher'}>Teacher</Button>
            <Button click={toggleView} active={view === 'student'}>Student</Button>
          </div> : null }
        </div>
        <div className={classes.Content}>
          <div className={classes.Tabs}>
            <TabList routingInfo={props.routingInfo} tabs={props.tabs} />
          </div>
          <div className={classes.MainContent}>
            {content}
          </div>
        </div>
      </div>
    </section>
  )
}

export default (dashboard);
