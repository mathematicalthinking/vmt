// Props:
  // resource: String, (room or course)
import React from 'react';
import BoxList from ''
import classes from './dashboardContent.css';
const dashboardContent = props => {
  return (
    <div className={classes.Container}>
      <div className={classes.ContentCreate}>

      </div>
      <div className={classes.ContentList}>
        <BoxList list={props.list} />
      </div>
    </div>
  )
}

export default dashboardContent;
