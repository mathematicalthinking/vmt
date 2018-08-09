import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import BoxList from '../../Layout/BoxList/BoxList';
import { getUserResources } from '../../store/reducers/';

class Templates extends Component {

  componentDidMount() {
    console.log('Courses mounted')
    console.log('props: ', this.props)
    // We should always have the user courses because we grab them when they login
    if (Object.keys(this.props.userCourseTemplates).length === 0) {
      this.props.populateCourseTemplates(this.props.userId);
    }
  }
  render(){
    console.log('Courses rendereddd')
    console.log('props: ', this.props)
    return (
      <div>
        <h2>Create a New Template</h2>
        {/* <NewCourse resource='course'/> */}
        <h2>Course Templates</h2>
        <BoxList list={this.props.userCourseTemplates}
          resource='courseTemplates'
          linkPath='/profile/courseTemplates/'
          linkSuffix='/rooms'
          template
        />
        <h2>Room Templates</h2>
      </div>
    )
  }
}

const mapStateToProps = store => ({
  userCourseTemplateIds: store.user.courseTemplates,
  userCourseTemplates: getUserResources(store, 'courseTemplates'),
  userRoomTemplates: getUserResources(store, 'roomTemplates'),
  userId: store.user.id,
})

const mapDispatchToProps = dispatch => ({
  populateCourseTemplates: ids => {dispatch(actions.getCourseTemplates(ids))},
  populateRoomTemplates: ids => {dispatch(actions.getRoomTemplates(ids))}
})
export default connect(mapStateToProps, mapDispatchToProps)(Templates);
