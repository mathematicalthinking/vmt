import React, { Component } from 'react';
import Filter from '../../Components/UI/Button/Filter/Filter';
import Button from '../../Components/UI/Button/Button';
import classes from './assignments.css';
import glb from '../../global.css';
import Dropdown from '../../Components/UI/Dropdown/Dropdown';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import * as actions from '../../store/actions';
import { connect } from 'react-redux';
class Assignments extends Component {
  state = {
    // assignment: {
    //   what: [{name: '', id: '', type: '',}],
    //   who: [{name: '', id: '', typr: '',}]
    assignCourses: true, // falses = rooms
    assignIndividuals: true, // false = teams
    assignment: {
      what: [],
      who: []
    },
    stage: 'what'
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

  assignWhat = selected => {
    console.log(selected)
    // add type to each selected element
    selected.forEach(item => item.type = this.state.assignCourses ? 'course' : 'room')
    // haha is this naming getting confusing? Its late
    const updatedAssignment = this.state.assignment;
    updatedAssignment.what = selected;
    this.setState({
      assignment: updatedAssignment,
    })
    console.log(this.state.assignment)
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
    let assignWhoList = [];

    // Get the lists of all rooms and courses to make selections from
    if (this.state.assignCourses && this.props.courses) {
      assignWhatList = this.props.courses.map(course => ({name: course.courseName, id: course._id}))
    }
    if (!this.state.assignCourses && this.props.rooms) {
      assignWhatTitle = 'Rooms'
      assignWhatList = this.props.rooms.map(room => ({name: room.name, id: room._id}));
    }

    // Get the lists of all individuals and team to make selections from
    if (this.state.assignIndividuals && this.props.users) {
      assignWhoList = this.props.users.map(user => ({name: user.username, id: user._id}))
    }

    if (!this.state.assignIndividuals && this.props.teams) {
      assignWhoTitle = 'Teams';
      assignWhoList = this.props.teams.map(team => ({name: team.name, id: team._id}))
    }

    // Make a list of rooms or courses already selected
    const selectedWhat = this.state.assignment.what.map(item => (
      <div id={item.id} key={item.id}>{item.name}</div>
    ))

    const selectedWho = this.state.assignment.who.map(item => (
      <div id={item.id} key={item.id}>{item.name}</div>
    ))
    return (
      <div className={classes.Assignments}>
        <h3>Select what you want to assign</h3>
        <div className={glb.FlexRow}>
          <div className={classes.Dropdown}>
            <Filter on={this.state.assignCourses} click={this.toggleWhat} >Assign {this.state.assignCourses ? 'Rooms' : 'Courses'}</Filter>
            <Dropdown list={assignWhatList} title={assignWhatTitle} selectHandler={this.assignWhat} />
          </div>
          <div className={classes.Selected}>
            <ContentBox title={`${assignWhatTitle} selected`}>
              {selectedWhat}
            </ContentBox>
          </div>
        </div>
        <h3>Select who you want to assign to</h3>
        <div className={glb.FlexRow}>
          <div className={classes.Dropdown}>
            <Filter on={this.state.assignIndividuals} click={this.toggleWho} >Assign {this.state.assignIndividuals ? 'Teams' : 'Individuals'}</Filter>
            <Dropdown list={assignWhoList} title={assignWhoTitle} selectHandler={this.assignWho} />
          </div>
          <div className={classes.Selected}>
            <ContentBox title={`${assignWhoTitle} selected`}>
              {selectedWho}
            </ContentBox>
          </div>
        </div>
        <div className={glb.FlexRow}>
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
  // users: store.userReducer.users,
  // teams: store.teamsReducer.teams,
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
