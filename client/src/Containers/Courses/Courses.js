import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import NewCourse from './NewCourse/NewCourse';
import * as actions from '../../store/actions';

class Courses extends Component {
  state = {
    allCourses: true
  }

  componentDidMount() {
    this.props.getCourses()
  }

  filter = (event) => {
    event.preventDefault();
    this.setState({allCourses: !this.state.allCourses})
  }

  render() {
    const courses = this.state.allCourses ? 'courses' : 'myCourses';
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

const mapDispatchToProps = dispatch => {
  return {
    getCourses: () => dispatch(actions.getCourses()),
  }
}

const mapStateToProps = store => ({
    courses: store.coursesReducer.courses,
    myCourses: store.authReducer.myCourses
  })


export default connect(mapStateToProps, mapDispatchToProps)(Courses);
