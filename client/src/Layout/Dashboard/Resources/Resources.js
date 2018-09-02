import React from 'react';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
const resources = props => {
  console.log("PROPS: ", props.userResources)
    // @TODO Is there a way to do this passing over the array only once?
    const ownedResources = props.userResources.filter(resource => (
      resource.creator === props.userId
    ))
    const enrolledResources = props.userResources.filter(resource => (
      resource.creator !== props.userId
    ))

    let linkPath =`/profile/${props.resource}/`
    let linkSuffix = props.resource === 'courses' ? '/assignments' : '/summary';
    const displayResource = props.resource[0].toUpperCase() + props.resource.slice(1);
    if (props.parentResource === 'courses') {
      linkPath = `/profile/${props.parentResource}/${props.parentResourceId}/${props.resource}/`
      linkSuffix = '/details'
    }
    return (
      <div>
        {props.parentResource !== 'assignments' ? <NewResource resource={props.resource} courseId={props.parentResource === 'courses'?  props.parentResourceId : null}/> : null}
        <h2>{displayResource} I Own</h2>
        <BoxList
          list={ownedResources}
          linkPath={linkPath}
          linkSuffix={linkSuffix}
          notifications = {props.notifications}
          resource = {props.resource}
          draggable
        />
        <h2>{displayResource} I'm Enrolled in</h2>
        <BoxList
          list={enrolledResources}
          linkPath={linkPath}
          linkSuffix={linkSuffix}
          notifications = {props.notifications}
        />
      </div>
    )
  }

export default resources;
