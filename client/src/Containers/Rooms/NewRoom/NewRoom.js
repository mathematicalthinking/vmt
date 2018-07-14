// @TODO NEED FILE UPLOAD FUNCTIONALITY

import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import NewTab from './NewTab/NewTab';
import Button from '../../../Components/UI/Button/Button';
import classes from './newRoom.css';

class NewRoom extends Component {
  state = {
    roomName: '',
    description: '',
    // tabCount: 0,
    // tabs: [],
  }

  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  addTab = event => {
    event.preventDefault();
    let tabCount = this.state.tabCount;
    tabCount++;
    this.setState({
      tabCount,
    })
  }

  removeTab = event => {
    event.preventDefault();
    let tabCount = this.state.tabCount;
    tabCount--;
    this.setState({
      tabCount,
    })
  }

  submitForm = event => {
    console.log("are we in here")
    event.preventDefault();
    const newRoom = {
      roomName: this.state.roomName,
      description: this.state.description,
      creator: this.props.userId
    }
    this.props.createRoom(newRoom)
    // this will be done on the backend but instead of fetching that data again
    // lets just update our redux store
    this.props.updateUserRooms(newRoom)
  }

  render() {
    let tabs = [];
    if (this.state.tabCount > 0) {
      for (let i = 0; i < this.state.tabCount; i++) {
        tabs.push(<NewTab change={this.changeHandler} id={i} key={i}/>)
      }
    }
    return (
      <div className={classes.NewRoom}>
        <form>
          <TextInput
            change={this.changeHandler}
            name="roomName"
            label="Enter Room Name"
            class='form-control'
          />
          <TextInput
            change={this.changeHandler}
            name='description'
            label='Description'
            class='form-control'
          />
        </form>
        <Button click={this.addTab}>Upload a file</Button>
        <Button click={this.submitForm}>Submit</Button>
      </div>
    )
  }
}

export default NewRoom;
