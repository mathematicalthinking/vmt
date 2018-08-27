import React from 'react';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
const resources = props => {
    // @TODO Is there a way to do this passing over the array only once?
    console.log('PROPS.USERrESOURCES ', props.userResources )
    console.log(props.notifications)
    const ownedResources = props.userResources.filter(resource => (
      resource.creator === props.userId
    ))
    const enrolledResources = props.userResources.filter(resource => (
      resource.creator !== props.userId
    ))
    const linkSuffix = props.resource === 'courses' ? '/assignments' : '/summary';
    const displayResource = props.resource[0].toUpperCase() + props.resource.slice(1);
    return (
      <div>
        <NewResource resource={props.resource}/>
        <h2>{displayResource} I Own</h2>
        <BoxList
          list={ownedResources}
          linkPath={`/profile/${props.resource}/`}
          linkSuffix={linkSuffix}
          notifications = {props.notifications}
        />
        <h2>{displayResource} I'm Enrolled in</h2>
        <BoxList
          list={enrolledResources}
          linkPath={`/profile/${props.resource}/`}
          linkSuffix={linkSuffix}
          notifications = {props.notifications}
        />
      </div>
    )
  }

export default resources;
