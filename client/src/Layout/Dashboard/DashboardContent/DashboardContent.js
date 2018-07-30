// Props:
  // resource: String, (room or course)
import React from 'react';
import BoxList from '../../BoxList/BoxList'
import classes from './dashboardContent.css';
const dashboardContent = props => {
  console.log(props.resource)
  console.log(props.resourceList)
  return (
    <div className={classes.Container}>
      <div className={classes.ContentCreate}>
        <h2>Create a new {props.resource}</h2>
        {/* <Button /> to create new room/course */}
      </div>
      <div className={classes.ContentList}>
        {/* <Filter /> created/enrolled*/}
        <BoxList list={props.resourceList} resource={props.resource} dashboard/>
      </div>
    </div>
  )
}

export default dashboardContent;
