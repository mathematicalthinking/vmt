// Props:
  // resource: String, (room or course)
import React from 'react';
// import BoxList from ''
import classes from './dashboardContent.css';
const dashboardContent = props => {
  return (
    <div className={classes.Container}>
      <div className={classes.ContentCreate}>
        <h2>Create a new {props.resource}</h2>
        {/* <Button /> to create new room/course*/}
      </div>
      <div className={classes.ContentList}>
        {/* <Filter /> created/enrolled*/}
        {/* <BoxList list={props.list} /> */}
      </div>
    </div>
  )
}

export default dashboardContent;
