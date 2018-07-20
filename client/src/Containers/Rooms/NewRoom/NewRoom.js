// @TODO NEED FILE UPLOAD FUNCTIONALITY

import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
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
    return (
      <div className={classes.NewRoom}>
        <form>
          <TextInput
            change={this.changeHandler}
            name='roomName'
            label='Enter Room Name'
          />
          <TextInput
            change={this.changeHandler}
            name='description'
            label='Description'
          />
        </form>
        <Button click={this.addTab}>Upload a file</Button>
        <Button click={this.submitForm}>Submit</Button>
      </div>
    )
  }
}

export default NewRoom;
