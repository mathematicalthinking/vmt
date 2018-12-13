// @TODO THIS SHOULD BE COMBINED WITH ACTIVITY DETAILS IN LAYOUT/DASHBOARD

import React, { Component } from 'react';
import classes from './room.css';
import { Button } from '../../Components';
import { withRouter } from 'react-router-dom';
class Summary extends Component {

  state = {
    assigning: false,
    instructions: this.props.room.instructions || ''
  }

  updateInstructions = event => {
    this.setState({instructions: event.target.value})
  }

  submitInstructions = () => {
    this.props.update(this.props.room._id, {instructions: this.state.instructions})
    this.props.toggleEdit();
  }

  render(){
    let { room, owner, loading, editing, toggleEdit } = this.props;
    return (
      <div className={classes.Container}>
        {/*  Make sure we have all of the room info before letting the user enter */}
        <div className={classes.Section}>
        {editing ?
              <div className={classes.Instructions}>
                <b>Instructions: </b>
                <textarea className={classes.TextArea} onChange={this.updateInstructions} value={this.state.instructions}/>
                <div className={classes.EditButtons}>
                  <div><Button theme={"Small"} m={10} click={this.submitInstructions}>Save</Button></div>
                  <div><Button m={10} click={this.props.toggleEdit}>Cancel</Button></div>
                </div>
              </div> :
              <div><b>Instructions:</b> {room.instructions || !owner ? room.instructions: <span className={classes.Edit} onClick={toggleEdit}>click here to add instructions</span>} </div>
            }
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
  

export default withRouter(Summary);
