import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import Dropdown from '../../../Components/UI/Dropdown/Dropdown';
import classes from './newCourse.css';
class NewCourse extends Component {
  state = {
    courseName: '',
    description: ''
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

  render() {
    // prepare dropdown list of rooms
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
              <div className={classes.SelectedRooms}>

              </div>
              <Dropdown list={dropdownList} title="Select Rooms..."/>
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
