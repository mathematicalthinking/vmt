import React, { Component } from 'react';
import TextInput from '../../../Components/Form/TextInput/TextInput';
import NewTab from './NewTab/NewTab';

class NewRoom extends Component {
  state = {
    roomName: '',
    description: '',
    tabCount: 0,
    tabs: [],
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
    console.log("are we in here")
    event.preventDefault();
    this.props.createRoom({
      roomName: this.state.roomName,
      description: this.state.description,
      creator: this.props.userId
    })
  }

  render() {
    let tabs = [];
    if (this.state.tabCount > 0) {
      for (let i = 0; i < this.state.tabCount; i++) {
        tabs.push(<NewTab change={this.changeHandler} id={i} key={i}/>)
      }
    }
    return (
      <div className='container-fluid'>
        <div className='row-fluid'>
          <div className='col-md-5'>
            <form>
              <div className='form-group'>
                <TextInput
                  change={this.changeHandler}
                  name="roomName"
                  label="Enter Room Name"
                  class='form-control'
                />
              </div>
              <div className='form-group'>
                <TextInput
                  change={this.changeHandler}
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
