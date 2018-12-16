// @TODO THIS SHOULD BE COMBINED WITH ACTIVITY DETAILS IN LAYOUT/DASHBOARD

import React, { Component } from 'react';
import classes from './roomDetails.css';
import { EditText } from '../../../Components';
class RoomDetails extends Component {

  render(){
    let { room, owner, editing, toggleEdit, updateRoomInfo, instructions } = this.props;
    console.log(editing)
    return (
      <div className={classes.Container}>
        {/*  Make sure we have all of the room info before letting the user enter */}
        <div className={classes.Instructions}>
            <span><b>Instructions: </b> </span>
            <span><EditText inputType='text-area' name='instructions' editing={editing} change={updateRoomInfo}>{instructions}</EditText></span>
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
