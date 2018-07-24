import React, { Component } from 'react';
import BoxList from '../../Layout/BoxList/BoxList';
import Search from '../../Components/Search/Search';
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

  filter = value => {
    console.log(value)
  }
  render () {
    return (
      <div>
        <h2>Courses</h2>
        <Search filter={value => this.filter(value)} />
        <BoxList list={this.state.courses}/>
      </div>
    )
  }
}

export default Courses;
