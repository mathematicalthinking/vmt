import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import BoxList from '../../Layout/BoxList/BoxList';
import NewCourse from '../Create/NewResource/NewResource'
class Courses extends Component {
  render(){
    const ownedResources = this.props.userCourses.filter(course => (
      course.creator === this.props.userId
    ))
    console.log(ownedResources)
    return (
      <div>
        <NewCourse resource='course'/>
        <h2>Courses I Own</h2>
        <BoxList list={ownedResources} resource='courses'
        linkPath='/profile/course/' linkSuffix='/rooms' notifications/>
        <h2>Courses I'm Enrolled in</h2>
      </div>
    )
  }
}

const mapStateToProps = store => ({
  // courses: getUserResources(store, 'courses'),
  userId: store.user.id,
})

const mapDispatchToProps = dispatch => ({
  // getUserCourses: userId => {dispatch(actions.getUserCourses)}
})
export default connect(mapStateToProps, mapDispatchToProps)(Courses);
