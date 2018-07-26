import React, { Component } from 'react';
import BoxList from '../../Layout/BoxList/BoxList';
import Search from '../../Components/Search/Search';
import classes from './courses.css';
import API from '../../utils/apiRequests';
// import { connect } from 'react-redux';
let allCourses = [];
class Courses extends Component {
  state = {
    courses: [],
  }
  componentDidMount() {
    API.get('course')
    .then(res => {
      allCourses = res.data.results
      this.setState({courses: allCourses})
    })
  }

  filterResults = value => {
    value = value.toLowerCase();
    const updatedCourses = allCourses.filter(course => {
      return (
        course.name.toLowerCase().includes(value) ||
        course.description.toLowerCase().includes(value) ||
        course.creator.toLowerCase().includes(value)
      )
    })
    this.setState({courses: updatedCourses})
  }
  render () {
    console.log(this.state.courses)
    return (
      <div>
        <h2>Courses</h2>
        <Search filter={value => this.filterResults(value)} />
        <div className={classes.Seperator}></div>
        <BoxList list={this.state.courses} resource='course'/>
      </div>
    )
  }
}

export default Courses;
