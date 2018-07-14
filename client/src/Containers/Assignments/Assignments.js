import React, { Component } from 'react';
import Button from '../../Components/UI/Button/Button';
import classes from './assignments.css';
import Dropdown from '../../Components/UI/Dropdown/Dropdown';
import * as acrions from '../../store/actions';
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
    let assignWhatTitle = this.state.assignCourses ? 'Courses' : 'Rooms';
    let assignWhatList ;
    let assignWhoTitle = this.state.assignIndividuals ? 'Individuals' : 'Teams';
    let assignWhoList  ;
    return (
      <div className={classes.Assignments}>
        <div>
          <Button>Confirm New Assignments</Button>
          <Button>Start Over</Button>
        </div>
        <div>
          <button onClick={this.toggleWhat} className='btn btn-default'>Assign {assignWhatTitle}</button>
          <section>
            <h4>{assignWhatTitle}</h4>
            <Dropdown list={assignWhatList} title={assignWhatTitle} selectHandler={this.assignWhat} />
          </section>
        </div>
        <div>
          <button onClick={this.toggleTo} className='btn btn-default'>Assign to </button>
          <section>
            <h4>{assignWhoTitle}</h4>
            <Dropdown list={assignWoList} title={assignWhoTitle} selectHandler={this.assignWho}/>
          </section>
        </div>
        <div className='col-md-4'>
          <h4>New Assignment Summary</h4>
        </div>
      </div>
    )
  }
}

const mapStateToProps = store => ({
  rooms: store.roomsReducer.rooms,
  courses: store.coursesReducer.courses,
})

const mapDispatchToProps = dispatch => {

}

export default connect(mapStateToProps, mapDispatchToProps)(Assignments);
