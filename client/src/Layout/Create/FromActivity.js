import React, { Component } from 'react';
import { Modal, RadioBtn, Button, TextInput } from '../../Components';
import { BoxList } from '../index';
import classes from './create.css'
class FromActivity extends Component {

  state = {
    community: true,
    ownResources: false,
    thisCourse: false,
    selected: [],
    dueDate: '',
  }

  componentDidMount() {
    window.addEventListener('keypress', this.onKeyPress)
  }

  componentWillUnmount() {
    window.removeEventListener('keypress', this.onKeyPress)
  } 

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.submit();
    }
  }

  select = id => {
    let updatedSelected = [...this.state.selected]
    updatedSelected.push(id)
    this.setState({selected: updatedSelected})
  }

  deSelect = id => {
    let updatedSelected = this.state.selected.filter(current => current !== id)
    this.setState({selected: updatedSelected})
  }

  submit = () => {
    this.state.selected.forEach(id => {
      if (this.props.mode === 'create') {
        this.props.create(id, this.props.userId, this.state.dueDate, this.props.course)
      } else {
        this.props.copy(id, this.props.userId, this.props.course)
      }
    })
    this.props.close();
  }
  
  render() {
    let list = []
    if (this.state.thisCourse) {
      list = this.props.courseActivities
    } else if (this.state.ownResources) list = this.props.userActivities;
    return (
      <Modal show={this.props.show} closeModal={this.props.close}>
        <div className={classes.Container}>
          <h3 className={classes.Title}>Create from an Existing Activity</h3>
          <div className={classes.Form}>
            <div className={classes.FormSection}>
              <div className={classes.VerticalButtons}>
                <RadioBtn 
                  name='community' 
                  checked={this.state.community} 
                  check={() => this.setState({community: true, ownResources: false, thisCourse: false})}
                >From the Community</RadioBtn>
                <RadioBtn 
                  name='ownActivities' 
                  checked={this.state.ownResources} 
                  check={() => this.setState({ownResources: true, thisCourse: false, community: false})}
                >From Your Activities</RadioBtn>
                {this.props.course && (this.props.resource !== 'activities') ? 
                <RadioBtn 
                  name='ownActivities' 
                  checked={this.state.thisCourse} 
                  check={() => this.setState({thisCourse: true, ownResources: false, community: false})}
                >From This Course</RadioBtn> : null}
              </div>
            </div>
           {this.props.mode === 'create' ? <div className={classes.FormSection}>
              <TextInput light label='Due Date (Optional)' name='dueDate' type='date' change={event => this.setState({dueDate: event.target.value})} />
            </div> : null}
            <div className={classes.Submit}>
              <Button click={this.submit} theme={"Small"} m={10}>Done</Button>
              <Button click={this.props.close} m={10}>Cancel</Button>
            </div>
            <div className={classes.Status}>You've selected {this.state.selected.length} activities</div>
            <div className={classes.ActivityList}>
              <BoxList list={list} selecting select={this.select}/>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default FromActivity