// @TODO NEED FILE UPLOAD FUNCTIONALITY

import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Button from '../../../Components/UI/Button/Button';
import RadioBtn from '../../../Components/Form/RadioBtn/RadioBtn';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/'
import classes from '../create.css';

class NewRoom extends Component {
  state = {
    roomName: '',
    description: '',
    isPublic: true,
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
      creator: this.props.userId,
      course: this.props.course,
      isPublic: this.state.isPublic,
    }
    this.props.createRoom(newRoom)
    this.setState({
      creating: false,
    })
    if (this.props.updateParent) {this.props.updateParent(newRoom)}
    // this will be done on the backend but instead of fetching that data again
    // lets just update our redux store
    // @TODO: actually ?? is this ^^ the way to do it
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
          <div className={classes.Container}>
            <h3 className={classes.Title}>Create a New Room</h3>
            <form className={classes.Form}>
              <TextInput
                change={this.changeHandler}
                name='roomName'
                label='Enter Room Name'
                width='50%'
              />
              <TextInput
                change={this.changeHandler}
                name='description'
                label='Description'
                width='100%'
              />
              <div className={classes.RadioButtons}>
                <RadioBtn checked={this.state.isPublic} check={() => this.setState({isPublic: true})}>Public</RadioBtn>
                <RadioBtn checked={!this.state.isPublic} check={() => this.setState({isPublic: false})}>Private</RadioBtn>
              </div>
              <div><Button click={this.addTab}>Upload a file</Button></div>
              <div className={classes.Submit}>
                <Button click={this.submitForm}>Submit</Button>
                <Button click={this.closeModal}>Cancel</Button>
              </div>
            </form>
          </div>
        </Modal>
        <Button click={() => {this.setState({creating: true})}}>Create</Button>
        {this.props.course ? <Button>Select From Template</Button> : null}
      </Aux>
    )
  }
}
const mapStateToProps = store => {
  return {
    rooms: store.roomsReducer.rooms,
    userId: store.userReducer.userId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createRoom: body => dispatch(actions.createRoom(body)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewRoom);
