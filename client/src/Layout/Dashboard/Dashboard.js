import React from 'react';
import classes from './dashboard.css';
import TabList from '../../Components/Navigation/TabList/TabList';
import BreadCrumbs from '../../Components/Navigation/BreadCrumbs/BreadCrumbs';
import DnDTrash from '../../Containers/DnDTrash/DnDTrash';
import Resources from './Resources/Resources';
import Students from '../../Containers/Students/Students'
import Trash from '../../Components/UI/Trash/Trash';
import Summary from '../Room/Summary/Summary';
import MakeRoomsLayout from './MakeRooms/MakeRooms';

const dashboard = props => {
  console.log(props)
  const {resource, parentResource, assignment, course, room, userId} = props.contentData;
  let content;
  if (parentResource === 'assignments' && resource === 'details') {
    content = <MakeRoomsLayout assignment={assignment} course={course} userId={userId}/>
  } else if (resource === 'summary') {
    content = <Summary room={room}/>
  } else {
    content = <DnDTrash>
      {resource === 'members' ? <Students {...props.contentData}/>
      : <Resources {...props.contentData} /> }
      <div className={classes.Trash}><Trash /></div>
    </DnDTrash>
  }
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
            {content}
          </div>
        </div>
      </div>
    </section>
  )
}

export default (dashboard);
