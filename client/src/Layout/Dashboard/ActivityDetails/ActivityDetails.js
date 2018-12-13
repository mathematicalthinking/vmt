// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Aux, Button, Modal } from '../../../Components';
import MakeRooms from '../../../Containers/Create/MakeRooms/MakeRooms';
import classes from './activityDetails.css'
class ActivityDetails extends Component {
  state = {
    assigning: false,
    instructions: this.props.activity.instructions || ''
  }

  updateInstructions = event => {
    this.setState({instructions: event.target.value})
  }

  submitInstructions = () => {
    this.props.update(this.props.activity._id, {instructions: this.state.instructions})
    this.props.toggleEdit();
  }

  setStartingPoint = () => {
    
    this.props.history.push(`/myVMT/workspace/${this.props.activity._id}/activity`)
  }

  render() {
    const { activity, course, editing, toggleEdit, owner } = this.props;
    return (
      <Aux>
        <div>
          {/* @TODO REPLACE THIS WITH <EDITABLEtEXT /> COMPONENT */}
          {editing ?
            <div className={classes.Instructions}>
              <b>Instructions: </b>
              <textarea className={classes.TextArea} onChange={this.updateInstructions} value={this.state.instructions}/>
              <div className={classes.EditButtons}>
                <div><Button theme={"Small"} m={10} click={this.submitInstructions}>Save</Button></div>
                <div><Button m={10} click={this.props.toggleEdit}>Cancel</Button></div>
              </div>
            </div> :
            <div><b>Instructions:</b> {activity.instructions || !owner ? activity.instructions: <span className={classes.Edit} onClick={toggleEdit}>click here to add instructions</span>} </div>
          }
          {!editing && owner 
            ? <div>
                <Button m={5} click={this.setStartingPoint}>Set Starting Point</Button>
                <Button m={5} click={() => {this.setState({assigning: true})}} data-testid='assign'>Assign</Button>
              </div> 
            : null
          }
        </div>
        {this.state.assigning ? <Modal show={true} closeModal={() => {this.setState({assigning: false})}}>
          <MakeRooms
            activity={activity}
            course={course ? course._id : null}
            userId={this.props.userId}
            close={() => {this.setState({assigning: false})}}
            participants={course ? course.members.filter(member => member.role === 'participant') : []}/>
        </Modal> : null}
      </Aux>
    )
  }
}

export default withRouter(ActivityDetails);
