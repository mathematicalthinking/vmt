import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
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
              <select>
                {/** this will need to be a dynamically rendered list**/}
                <option value='1'>{this.props.course}</option>
              </select>
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
