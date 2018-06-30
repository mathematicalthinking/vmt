import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
class NewRoom extends Component {
  state = {
    roomName: '',
    description: ''
  }

  changeHandler = (event) => {
    let updatedControls =  { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    })
  }

  submitForm = (event) => {
    event.preventDefault();

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
                  label="Enter Room Name"
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
              <button className='btn btn-default' onClick={this.addTab}>Add Tab</button>
              <p></p>
              <button className='btn btn-default' onClick={this.submitForm}>Submit</button>
            </form>
          </div>
        </div>
      </div>
    )
  }
}

export default NewRoom;
