import React, { Component } from 'react';
import Filter from '../../Components/UI/Button/Filter/Filter';
import Button from '../../Components/UI/Button/Button';
import classes from './assignment.css';
import Aux from '../../Components/HOC/Auxil';
import MakeRooms from './MakeRooms/MakeRooms';
import Modal from '../../Components/UI/Modal/Modal';
import glb from '../../global.css';
// import Dropdown from '../../Components/UI/Dropdown/Dropdown';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import TextInput from '../../Components/Form/TextInput/TextInput';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import * as actions from '../../store/actions';
import { connect } from 'react-redux';
class Assignment extends Component {
  state = {
    tabs: [
      {name: 'Details'},
      {name: 'Rooms'},
      {name: 'Settings'},
    ],
    assigning: false,
  }

  render() {
    const resource = this.props.match.params.resource;
    const assignment = this.props.currentAssignment
    let content;
    switch (resource) {
      case 'details':
        content = <div>
          <div>Assignment Name: {assignment.name}</div>
          <div>Details: {assignment.description}</div>
          <div>Due Date: {assignment.dueDate ? assignment.dueDate : <TextInput name='dueDate' type='date'/> }</div>
          <div>Type: {assignment.roomType}</div>
          <Button click={() => {this.setState({assigning: true})}}>Activate</Button>
        </div>
        break;
      default : content = null;
    }
    console.log(this.props.match)
    return (
      <Aux>
        <DashboardLayout
          routingInfo={this.props.match}
          crumbs={[]}
          sidePanelTitle={'side panel'}
          content={content}
          tabs={this.state.tabs}
        />
        {this.state.assigning ? <Modal show={true} closeModal={() => {this.setState({assigning: false})}}>
          <MakeRooms />
        </Modal> : null}
          </Aux>
        )
  }
}

const mapStateToProps = (store, ownProps )=> ({
  currentAssignment: store.assignments.byId[ownProps.match.params.assignment_id]// rooms: store.rooms
})

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getCourses: () => dispatch(actions.getCourses()),
    getRooms: () => dispatch(actions.getRooms()),
    // updateUserCourses: newCourse => dispatch(actions.updateUserCourses(newCourse)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignment);
