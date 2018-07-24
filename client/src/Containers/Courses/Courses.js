import React, { Component } from 'react';
import BoxList from '../../Layout/BoxList/BoxList';
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
  render () {
    return (
      <div>
        <BoxList list={this.state.courses}/>
      </div>
    )
  }
}

export default Courses;
