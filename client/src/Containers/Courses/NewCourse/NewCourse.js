import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Dropdown from '../../../Components/UI/Dropdown/Dropdown';
import Button from '../../../Components/UI/Button/Button';
import classes from './newCourse.css';
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
    }
    this.setState({
      courseName: '',
      description: '',
      rooms: [],
      creating: false,
    })
    // update backend via redux so we can add this to the global state of courses
    this.props.createCourse(newCourse);
    this.props.updateUserCourses(newCourse);
  }
  // this will be passed down to the dropdown menu and when we make a selection
  // it will pass a list of selected rooms back up and then we can synch our state
  updateRooms = rooms => {
    this.setState({
      rooms: rooms
    })
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
      this.state.creating ? <div className={classes.NewCourse}>
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
            <Button click={() => this.setState({creating: false})}>Cancel</Button>
          </div>
        </form>
      </div> : <Button click={() => {this.setState({creating: true})}}>Create</Button>
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
    updateUserCourses: newCourse => dispatch(actions.updateUserCourses(newCourse)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewCourse);
