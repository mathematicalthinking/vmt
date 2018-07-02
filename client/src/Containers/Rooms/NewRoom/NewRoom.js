import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import NewTab from './NewTab/NewTab';

class NewRoom extends Component {
  state = {
    roomName: '',
    description: '',
    tabCount: 0,
  }

  changeHandler = (event) => {
    let updatedControls =  { ...this.state.controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    })
  }

  addTab = (event) => {
    console.log('we in here')
    event.preventDefault();
    let tabCount = this.state.tabCount;
    tabCount++;
    this.setState({
      tabCount,
    })
  }

  submitForm = (event) => {
    event.preventDefault();

  }

  render() {
    let tabs = [];
    if (this.state.tabCount > 0) {
      for (let i = 0; i < this.state.tabCount; i++) {
        tabs.push(<NewTab />)
      }
    }
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
              {tabs}
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
