import React, { Component } from 'react';
import { TextInput, RadioBtn, Button } from '../../Components';
import API from '../../utils/apiRequests';
class NewTabForm extends Component {
  
  state = {
    name: '',
    instructions: '',
    tabType: '',
    desmosLink: '',
    ggb: true,
  }

  changeHandler = (event) => {
    this.setState(
      {[event.target.name]: event.target.value}
    )
  }

  submit = () => {
    console.log(this.props.activity)
    API.post('tabs', {
      name: this.state.name,
      instructions: this.state.instructions,
      tabType: this.state.ggb ? 'geogebra' : 'desmos',
      desmosLink: this.state.desmosLink,
      room: this.props.room ? this.props.room._id : null,
      activity: this.props.activity ? this.props.activity._id : null,
    })
    .then(res => {
      console.log(res)
      let tabs;
      if (this.props.room) {
        tabs = [...this.props.room.tabs];
        tabs.push(res.data.result)
        this.props.updatedRoom(this.props.room._id, {tabs,})
      } else {
        tabs = [...this.props.activity.tabs]
        tabs.push(res.data.result)
        // UPDATE REDUX ACTIVITY
        this.props.updatedActivity(this.props.activity._id, {tabs,})
      }
      this.props.closeModal();
    })
    .catch(err => {
      console.log('there was an error: ', err)
      // DISPLAY THIS ERROR MESSAGE: @TODO
    })
  }

  render(){
    return (
      <div>
        <h2>Create A New Tab</h2>
        <TextInput light value={this.state.name} change={this.changeHandler} name='name' label='Name' autofill='none'/>
        <TextInput light value={this.state.instructions} change={this.changeHandler} name='instructions' label='Instructions'/>
        <div style={{display: 'flex', justifyContent: 'space-around'}}>
          <RadioBtn name='geogebra' checked={this.state.ggb} check={() => this.setState({ggb: true})}>GeoGebra</RadioBtn>
          <RadioBtn name='desmos' checked={!this.state.ggb} check={() => this.setState({ggb: false})}>Desmos</RadioBtn>
        </div>
        {this.state.ggb ?
        <div>
          <div>Import a GeoGebra  (optional)</div>
          <div><Button>Select a Geogebra File (optional)</Button></div>
        </div> :
        <TextInput
          light
          name='desmosLink'
          label='Paste a Desmos workspace'
          change={this.changeHandler}
          width='80%'
        />}
        <Button m={10} click={this.submit}>Create</Button>
      </div>
    )
  }
}
export default NewTabForm;