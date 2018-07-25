import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Dropdown from '../../../Components/UI/Dropdown/Dropdown';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Button from '../../../Components/UI/Button/Button';
import classes from '../create.css';
import glb from '../../../global.css';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/';
class NewCourse extends Component {
  state = {
    courseName: '',
    description: '',
    rooms: [],
    creating: false,
  }

  changeHandler = event => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  submitForm = event => {
    event.preventDefault();
    const roomIds = this.state.rooms.map(room => room.id);
    const newCourse = {
      name: this.state.courseName,
      description: this.state.description,
      rooms: roomIds,
      creator: this.props.userId,
      members: [{user: this.props.userId, role: 'teacher'}]
    }
    this.setState({
      courseName: '',
      description: '',
      rooms: [],
      creating: false,
    })
    // update backend via redux so we can add this to the global state of courses
    this.props.createCourse(newCourse);
  }
  // this will be passed down to the dropdown menu and when we make a selection
  // it will pass a list of selected rooms back up and then we can synch our state
  updateRooms = rooms => {
    this.setState({
      rooms: rooms
    })
  }

  closeModal = event => {
    event.preventDefault();
    this.setState({creating: false})
  }

  render() {
    // prepare dropdown list of rooms
    const roomsSelected = this.state.rooms.map(room => (
      // sel- to differentiate between dropdown ids
      <div id={`sel-${room.id}`}>{room.name}</div>
    ))
    // i find this to be annoying...why wont .map just return an empty array
    // if this.props.myRooms does not exist
    let myRooms;
    if (this.props.myRooms) {
      myRooms = this.props.myRooms.map(room => ({
        id: room._id, name: room.name,
      }))
    }
    const publicRooms = this.props.rooms.map(room => ({
      id: room._id, name: room.name
    }))
    return (
      <Aux>
        <Modal
          show={this.state.creating}
          closeModal={this.closeModal}
        ><div className={classes.Container}>
          <h3 className={classes.Title}>Create a New Course</h3>
          <form className={classes.Form}>
            <TextInput
              name='courseName'
              label='Course Name'
              change={this.changeHandler}
              width='40%'
            />
            <TextInput
              name='description'
              label='Description'
              change={this.changeHandler}
              width='80%'
            />
            <div className={glb.FlexRow}>
              <Button click={this.submitForm}>Submit</Button>
              <Button click={this.closeModal}>Cancel</Button>
            </div>
          </form>
        </div>
        </Modal>
        <Button click={() => {this.setState({creating: true})}}>Create</Button>
      </Aux>
    )
  }
}

const mapStateToProps = store => {
  return {
    myRooms: store.userReducer.myRooms,
    rooms: store.roomsReducer.rooms,
    userId: store.userReducer.userId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createCourse: body => dispatch(actions.createCourse(body)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCourse);
