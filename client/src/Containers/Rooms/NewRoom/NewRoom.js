// @TODO NEED FILE UPLOAD FUNCTIONALITY

import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Button from '../../../Components/UI/Button/Button';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/'
import classes from './newRoom.css';

class NewRoom extends Component {
  state = {
    roomName: '',
    description: '',
    creating: false,
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
      name: this.state.roomName,
      description: this.state.description,
      creator: this.props.userId
    }
    this.props.createRoom(newRoom)
    this.setState({
      creating: false,
    })
    // this will be done on the backend but instead of fetching that data again
    // lets just update our redux store
    // this.props.updateUserRooms(newRoom)
  }

  closeModal = event => {
    event.preventDefault();
    this.setState({creating: false})
  }

  render() {
    return (
      <Aux>
        <Modal
          show={this.state.creating}
          closeModal={this.closeModal}
        >

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
            <Button click={this.closeModal}>Cancel</Button>
          </div>
        </Modal>
        <Button click={() => {this.setState({creating: true})}}>Create</Button>
      </Aux>
    )
  }
}
const mapStateToProps = store => {
  return {
    rooms: store.roomsReducer.rooms,

    // username: store.userReducer.username,
    userId: store.userReducer.userId,
    // createdNewRoom: store.roomsReducer.createdNewRoom,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createRoom: body => dispatch(actions.createRoom(body)),
    // updateUserRooms:
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewRoom);
