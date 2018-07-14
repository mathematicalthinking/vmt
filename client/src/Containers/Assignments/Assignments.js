import React, { Component } from 'react';
import Filter from '../../Components/UI/Button/Filter/Filter';
import Button from '../../Components/UI/Button/Button';
import classes from './assignments.css';
import Dropdown from '../../Components/UI/Dropdown/Dropdown';
import * as actions from '../../store/actions';
import { connect } from 'react-redux';
class Assignments extends Component {
  state = {
    // assignment: {
    //   what: [{id: '', type: '',}],
    //   who: [{id: '', typr: '',}]
    assignCourses: true, // falses = rooms
    assignIndividuals: true, // false = teams
    assignment: {
      what: [],
      who: []
    },
  }

  componentDidMount() {
    // check if we have have the data we need in the redux store
      // if not get it @TODO is this the best way to handle things? should we just gett
      // all of the data at the beginning ?
      console.log('courses', this.props.courses)
    if (this.props.courses.length === 0) {
      this.props.getCourses();
    }

  }

  toggleWhat = () => {
    console.log('we in here')
    const assignCourses = this.state.assignCourses;
    this.setState({
      assignCourses: !assignCourses
    })
  }

  assignWhat = id => {
    let type = this.state.assignCourses ? 'course' : 'room';
    // haha is this naming getting confusing? Its late
    const updatedAssignment = this.state.Assignment;
    const what = { id, type, };
    const updatedWhat = [...this.state.assignment.what, what];
    updatedAssignment.what = updatedWhat;
    this.setState({
      assignment: updatedAssignment,
    })
  }

  toggleWho = () => {
    const assignIndividuals = this.state.assignIndividuals;
    this.setState({
      assignIndividuals: !assignIndividuals
    })
  }

  assignWho = id => {
    let type = this.state.assignIndividuals? 'user' : 'team';
    // haha is this naming getting confusing? Its late
    const updatedAssignment = this.state.Assignment;
    const who = { id, type, };
    const updatedWho = [...this.state.assignment.who, who];
    updatedAssignment.who = updatedWho;
    this.setState({
      assignment: updatedAssignment,
    })
  }

  submitAssignment = () => {

  }

  render() {
    let assignWhatTitle = 'Courses';
    let assignWhoTitle = 'Individuals';
    let assignWhatList;
    let assignWhoList;

    if (this.state.assignCourses && this.props.courses) {
      assignWhatList = this.props.courses.map(course => ({name: course.name, id: course._id}))
    }
    if (!this.state.assignCourses && this.props.rooms) {
      assignWhatTitle = 'Rooms'
      assignWhatList = this.props.rooms.map(room => ({name: room.name, id: room._id}));
    }
    return (
      <div className={classes.Assignments}>
        <div>
          <Filter on={this.state.assignCourses} click={this.toggleWhat} >Assign {this.state.assignCourses ? 'Courses' : 'Rooms'}</Filter>
          <section>
            <h4>{assignWhatTitle}</h4>
            <Dropdown list={assignWhatList} title={assignWhatTitle} selectHandler={this.assignWhat} />
          </section>
        </div>
        <div>
          <button onClick={this.toggleTo} className='btn btn-default'>Assign to </button>
          <section>
            <h4>{assignWhoTitle}</h4>
            {/* <Dropdown list={assignWhoList} title={assignWhoTitle} selectHandler={this.assignWho}/> */}
          </section>
        </div>
        <div className='col-md-4'>
          <h4>New Assignment Summary</h4>
        </div>
        <div>
          <Button>Confirm New Assignments</Button>
          <Button>Start Over</Button>
        </div>
      </div>
    )
  }
}

const mapStateToProps = store => ({
  rooms: store.roomsReducer.rooms,
  courses: store.coursesReducer.courses,
})

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getCourses: () => dispatch(actions.getCourses()),
    getRooms: () => dispatch(actions.getRooms()),
    // updateUserCourses: newCourse => dispatch(actions.updateUserCourses(newCourse)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignments);
