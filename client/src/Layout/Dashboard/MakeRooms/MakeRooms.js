// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

import React, { Component } from 'react';
import { Aux, Button, Modal } from '../../../Components';
import classes from './makeRooms.css'
class MakeRoomsLayout extends Component {
  state = {
    assigning: false,
  }
  render() {
    const { activity, course, editing, toggleEdit } = this.props
    console.log(editing)
    return (
      <Aux>
        <div>
          <div><b>Instructions:</b> {activity.instructions ? activity.instructions: <span className={classes.Edit} onClick={toggleEdit}>click here to add instructions</span>} </div>
          <Button click={() => {this.setState({assigning: true})}} data-testid='assign'>Assign</Button>
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

export default MakeRoomsLayout;
