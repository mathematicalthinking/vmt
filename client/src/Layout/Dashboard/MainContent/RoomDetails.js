// @TODO THIS SHOULD BE COMBINED WITH ACTIVITY DETAILS IN LAYOUT/DASHBOARD

import React, { Component } from 'react';
import classes from './roomDetails.css';
import { EditText, Error } from '../../../Components';// @TODO consider combining Error and Edit Text into one component
class RoomDetails extends Component {

  render(){
    let { room, editing, updateRoomInfo, instructions, loading } = this.props;
    let { updateFail, updateKeys } = loading
    return (
      <div className={classes.Container}>
        {/*  Make sure we have all of the room info before letting the user enter */}
        <div className={classes.Instructions}>
            <b>Instructions: </b>
            <Error error={updateFail && updateKeys.indexOf('instructions') > -1}><EditText inputType='text-area' name='instructions' editing={editing} change={updateRoomInfo}>{instructions}</EditText></Error>
        </div>
        <div className={classes.Section}>
          <div>
            {/*CONSIDER: COULD REPLACE THESE 0'S WITH LOADING SPINNERS? */}
           {/* {room.graphImage && room.graphImage.imageData !== '' ? <div><div><b>Current Construction: </b></div><img className={classes.StateImage} src={room.graphImage.imageData} alt="current-state"/></div> : null} */}
            <div><b>Current Members: </b>{room.currentMembers ? room.currentMembers.length : 0}</div>
            <div><b>Tabs: </b>{room.tabs ? room.tabs.length : 0}</div>
            <div><b>Messages: </b>{room.chat ? room.chat.length : 0}</div>
          </div>
        </div>
        <div className={classes.Section}>
          {/* <div>Events: </div>{room.events ? room.events.length : 0} */}
        </div>
      </div>
    )
  }

}


export default RoomDetails;
