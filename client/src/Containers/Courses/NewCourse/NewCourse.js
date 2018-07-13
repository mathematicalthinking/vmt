import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Dropdown from '../../../Components/UI/Dropdown/Dropdown';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
import classes from './newCourse.css';
class NewCourse extends Component {
  state = {
    courseName: '',
    description: '',
    rooms: [],
  }

  changeHandler = event => {
    let updatedControls =  { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    })
  }

  addRoom = () => {

  }

  submitForm = event => {
    event.preventDefault();
    console.log('do nopthiong?')
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
    const dropdownList = this.props.myRooms.map(room => ({
      id: room._id, name: room.roomName,
    }))
    return (
      <div className='container-fluid'>
        <div className='row-fluid'>
          <div className='col-md-5'>
            <form>
              <div className='form-group'>
                <TextInput
                  name="roomName"
                  label="Enter Course Name"
                  class='form-control'
                />
              </div>
              <div className='form-group'>
                <TextInput
                  name='description'
                  label='Description'
                  class='form-control'
                />
              </div>
              <ContentBox title="Rooms added to this course">
                {roomsSelected}
              </ContentBox>
              <Dropdown list={dropdownList} title="Select Rooms..." selectHandler={this.updateRooms}/>
              <button className='btn btn-default' onClick={this.addTab}>Add Room</button>
              <p></p>
              <button className='btn btn-default' onClick={this.submitForm}>Submit</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default NewCourse;
