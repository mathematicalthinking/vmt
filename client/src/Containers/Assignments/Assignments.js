import React, { Component } from 'react';
import Aux from '../../Components/HOC/Auxil';
class Assignments extends Component {
  state = {
    assignCourses: true, // falses = rooms
    assignIndividuals: true, // false = teams
  }

  toggleWhat = () => {
    console.log('we in here')
    const assignCourses = this.state.assignCourses;
    this.setState({
      assignCourses: !assignCourses
    })
  }

  toggleTo = () => {
    const assignIndividuals = this.state.assignIndividuals;
    this.setState({
      assignIndividuals: !assignIndividuals
    })
  }

  render() {
    const courses = ['sampleCourse1', 'samplecourse2'];
    const teams = ['sampleteam1', 'sampleTeam2'];
    const rooms = ['sampleRoom1', 'sampleRoom2'];
    const users = ['sampleUser1', 'sampleUser2'];

    let assignWhat = 'Assign Courses';
    let assignWhatTitle = 'Courses you can assign';
    let assignWhatList = courses.map(course => <div>{course}</div>)
    let assignTo = 'Assign to individuals';
    let assignToTitle = 'Users to give assignments';
    let assignToList = users.map(user => <div>{user}</div>)

    if (!this.state.assignCourses) {
      assignWhat = 'Assign Rooms';
      assignWhatTitle = 'Rooms you can assign';
      assignWhatList = rooms.map(room => (
        <div>{room}</div>
      ))
    }

    if (!this.state.assignIndividuals) {
      assignTo = 'Assign Teams';
      assignToTitle = 'Teams to give assignments';
      assignToList = teams.map(team => <div>{team}</div>)
    }
    return (
      <Aux>
        <div className='col-md-12'>
          <button className='btn btn-primary'>Confirm New Assignments</button>
          <button className='btn btn-warning'>Start Over</button>
        </div>
        <div className='container-fluid'>
          <div className='row-fluid'>
            <div className='col-md-4'>
              <div>
                <button onClick={this.toggleWhat} className='btn btn-default'>{assignWhat}</button>
                <section>
                  <h4>{assignWhatTitle}</h4>
                  {assignWhatList}
                </section>
              </div>
            </div>
            <div className='col-md-4'>
              <button onClick={this.toggleTo} className='btn btn-default'>{assignTo}</button>
              <section>
                <h4>{assignToTitle}</h4>
                {assignToList}
              </section>
            </div>
            <div className='col-md-4'>
              <h4>New Assignment Summary</h4>
            </div>
          </div>
        </div>
      </Aux>
    )

  }
}

export default Assignments;
