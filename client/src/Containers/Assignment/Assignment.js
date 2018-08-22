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
    console.log(this.props.match)
    console.log('CURRENT ASSIGNMENT: ', this.props.currentAssignment)
    const resource = this.props.match.params.resource;
    const assignment = this.props.currentAssignment
    const course = this.props.currentCourse;
    console.log('CURRENT COURSE: ', course)
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
    return (
      <Aux>
        <DashboardLayout
          routingInfo={this.props.match}
          crumbs={[
            {title: 'Profile', link: ''},
            {title: `${course.name}`, link: ''},
            {title: `Assignment ${assignment.name}`, link: ''}
          ]}
          sidePanelTitle={'side panel'}
          content={content}
          tabs={this.state.tabs}
        />
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

const mapStateToProps = (store, ownProps ) => {
  const { assignment_id, course_id } = ownProps.match.params;
  return {
    currentAssignment: store.assignments.byId[assignment_id],
    currentCourse: store.courses.byId[course_id],
    userId: store.user.id,
  }
}

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getCourses: () => dispatch(actions.getCourses()),
    getRooms: () => dispatch(actions.getRooms()),
    // updateUserCourses: newCourse => dispatch(actions.updateUserCourses(newCourse)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignment);
