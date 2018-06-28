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
      <form onSubmit={this.submitForm}>
        <TextInput
          name="roomName"
          label="Enter Room Name"
        />
        <TextInput
          name="description"
          label="Description"
        />
        <input type='submit' value='submit' />
      </form>
    )
  }
}

export default NewRoom;
