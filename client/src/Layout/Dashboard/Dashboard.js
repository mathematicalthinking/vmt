import React from 'react';
import { Link } from 'react-router-dom';
import classes from './dashboard.css';
import TabList from '../../Components/Navigation/TabList/TabList';
import BreadCrumbs from '../../Components/Navigation/BreadCrumbs/BreadCrumbs';
import DnDTrash from '../../Components/HOC/DnDTrash';
import Resources from './Resources/Resources';
import Members from '../../Containers/Members/Members'
import Trash from '../../Components/UI/Trash/Trash';
import Avatar from '../../Components/UI/Avatar/Avatar';
import Button from '../../Components/UI/Button/Button';
import Summary from '../Room/Summary/Summary';
import MakeRoomsLayout from './MakeRooms/MakeRooms';

const dashboard = props => {
  let {contentData, sidePanelData, view, toggleView} = props;
  let {resource, parentResource, activity, course, room, user} = contentData;
  let content;
  if (parentResource === 'activities' && resource === 'details') {
    content = <MakeRoomsLayout activity={activity} course={course} userId={user._id}/>
  } else if (resource === 'summary') {
    content = <Summary room={room} loading={props.loading}/>
  } else {
    content = <DnDTrash>
      {resource === 'members' ? <Members {...props.contentData}/>
      : <Resources {...props.contentData} /> }
      <div className={classes.Trash}><Trash /></div>
    </DnDTrash>
  }

  let image = <img src={sidePanelData.image} alt='sidePanelImage'/>
  if (!sidePanelData.image) { 
    if (sidePanelData.title === 'My VMT') {
      image = <Avatar size='large'/>
    }
  }  
  let { additional } = sidePanelData.details;
  let additionalDetails = Object.keys(additional).map(detail => (
    <div className={classes.Detail}>{detail}: <span className={classes.DetailInfo}>{additional[detail]}</span></div>
  ))
  return (
    <section className={classes.Container}>
      <div className={classes.BreadCrumbs}>
        <BreadCrumbs crumbs={props.crumbs}/>
      </div>
      <div className={classes.Main}>
        <div className={classes.SidePanel}>
          <div>
            <div className={classes.Image}>{image}</div>
            <div className={classes.Details}>
              <div className={classes.spMain}>{sidePanelData.details.main}</div>
              <div className={classes.spSecondary}>{sidePanelData.details.secondary}</div>
              <div className={classes.spAdditional}>
                {additionalDetails}
              </div>
            </div>
            <div className={classes.ViewOpts}></div>
          </div>
          {user.accountType === 'participant' && !props.bothRoles ? <div className={classes.CreateForParticipant}><Link to='facilitator'>become a facilitator</Link></div> : null}
          {props.bothRoles ? 
          <div>
            <div>view as...</div>
            <Button m={5} click={toggleView} active={view === 'facilitator'}>Facilitator</Button>
            <Button m={5} click={toggleView} active={view === 'participant'}>Participant</Button>
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
