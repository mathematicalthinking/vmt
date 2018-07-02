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
      <li><label>Name: </label><Link to={`/course/${course._id}`}>{course.name}</Link></li>
    ))
    console.log(this.props.match.path);
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
            {/* eventually we'll want to make this.props.myRooms the whole list
            but for now we can just send the first element */}
            {(this.props.match.path === '/courses/new') ? <NewCourse room={this.props.myRooms[0]}/> : null}
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
    myCourses: store.userReducer.myCourses,
    myRooms: store.userReducer.myRooms
  })


export default connect(mapStateToProps, mapDispatchToProps)(Courses);
