import React, { Component } from 'react';
import Button from '../../../Components/UI/Button/Button';
import Modal from '../../../Components/UI/Modal/Modal';
import Aux from '../../../Components/HOC/Auxil';
import MakeRooms from '../../../Containers/Create/MakeRooms/MakeRooms';
class MakeRoomsLayout extends Component {
  state = {
    assigning: false,
  }
  render() {
    const { assignment, course } = this.props
    return (
      <Aux>
        <div>
          <div>Assignment Name: {assignment.name}</div>
          <div>Details: {assignment.description}</div>
          <div>Type: {assignment.roomType}</div>
          <Button click={() => {this.setState({assigning: true})}}>Activate</Button>
        </div>
        {this.state.assigning ? <Modal show={true} closeModal={() => {this.setState({assigning: false})}}>
          <MakeRooms
            assignment={assignment}
            course={course._id}
            userId={this.props.userId}
            close={() => {this.setState({assigning: false})}}
            students={course.members.filter(member => member.role === 'Student')}/>
        </Modal> : null}
      </Aux>
    )
  }
}

export default MakeRoomsLayout;
