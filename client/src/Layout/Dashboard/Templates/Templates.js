import React from 'react';
import BoxList from '../../BoxList/BoxList';
import NewResource from '../../../Containers/Create/NewResource/NewResource';
import classes from './templates.css';
const templates = props => {
  const noContent = `You don't seem to have anything here yet. To get started click "Create"`
  return (
    <div className={classes.Container}>
      <div className={classes.List}>
        <NewResource resource='course' template/>
        <NewResource resource='room' template/>
      </div>
      <div className={classes.List}>
        <h2>Course Templates</h2>
        {props.courses ? <BoxList list={props.courses} resource='course'/> : noContent}
          </div>
      <div className={classes.List}>
        <h2>Room Templates</h2>
        {props.rooms ? <BoxList list={props.rooms} resource='room' /> : noContent}
      </div>
    </div>
  )
}

export default templates;
