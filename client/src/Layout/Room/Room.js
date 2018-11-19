import React from 'react';
import classes from './room.css';
import { Button } from '../../Components';
import { withRouter } from 'react-router-dom';
const summary = ({room, populateRoom, history, loading}) => {
  
  const goToWorkspace = () => {
    history.push(`/myVMT/workspace/${room._id}`);
  }
  const goToReplayer = () => {
    if (room.events.length > 0) {
      history.push(`/myVMT/workspace/${room._id}/replayer`)
    } else {

      // SOME SORT OF ERROR MESSAGE
    }
  }
  return (
    <div className={classes.Container}>
      {/*  Make sure we have all of the room info before letting the user enter */}
      <div className={classes.Section}>
        {room.instructions ? <div><b>Instructions: </b>room.instructions</div> : null}
      </div>
      <div className={classes.Section}>
        <div>
          {/*CONSIDER: COULD REPLACE THESE 0'S WITH LOADING SPINNERS? */}
         {room.graphImage && room.graphImage.imageData !== '' ? <div><div><b>Current Construction: </b></div><img className={classes.StateImage} src={room.graphImage.imageData} alt="current-state"/></div> : null}
          <div><b>Current Members: </b>{room.currentMembers ? room.currentMembers.length : 0}</div>
          <div><b>Total Events: </b>{room.events ? room.events.length : 0}</div>
          <div><b>Total Messages: </b>{room.chat ? room.chat.length : 0}</div>
        </div>
      </div>
      <div className={classes.Buttons}>
        <span className={classes.Button}><Button theme={loading ? 'SmallCancel' : 'Small'} m={5} click={!loading ? goToWorkspace : () => null}>Join</Button></span>
        <span className={classes.Button}><Button theme={(loading || room.events.length === 0) ? 'SmallCancel' : 'Small'} m={5} click={!loading ? goToReplayer : () => null}>Replayer</Button></span>
      </div>
      <div className={classes.Section}>
        {/* <div>Events: </div>{room.events ? room.events.length : 0} */}
      </div>
    </div>
  )
}

export default withRouter(summary);
