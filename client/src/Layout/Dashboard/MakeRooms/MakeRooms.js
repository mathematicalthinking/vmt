// THIS DOESN"T FEEL LIKE ITS IN A VERY LOGICAL PLACE IN THE FILE STRUCUTRE

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
    const { activity, course } = this.props
    return (
      <Aux>
        <div>
          <div>Activity Name: {activity.name}</div>
          <div>Details: {activity.description}</div>
          <div>Type: {activity.roomType}</div>
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
