import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NewCourse from './NewCourse/NewCourse';
class Courses extends Component {
  state = {
    allCourses: true
  }

  filter = (event) => {
    event.preventDefault();
    this.setState({allCourses: !this.state.allCourses})
  }

  render() {
    const courses = this.state.allRooms ? 'courses' : 'myCourses';
    const courseElems = this.props[courses].map(course => (
      <li><label>Name: </label><Link to={`/room/${course._id}`}>{course.name}</Link></li>
    ))
    return (
      <div className='container-fluid'>
        <div className='row-fluid'>
          <div className='col-md-2'>
            <label>Show my courses:</label>
            <input type='checkbox' name='showMyCourses' onClick={this.filter}/>
            <ul>
              {courseElems}
            </ul>
          </div>
          <div className='col-md-10'>
            {(this.props.match.path === '/courses/new') ? <NewCourse /> : null}
          </div>
        </div>
      </div>
    )
  }
}


export default Courses;
