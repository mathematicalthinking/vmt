import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import * as actions from '../../store/actions';
import { connect } from 'react-redux';
import { populateResource } from '../../store/reducers/';
class Assignment extends Component {
  state = {
    tabs: [
      {name: 'Details'},
      {name: 'Rooms'},
      {name: 'Settings'},
    ],
    assigning: false,
  }

  render() {
    const resource = this.props.match.params.resource;
    const assignment = this.props.currentAssignment
    const course = this.props.currentCourse;
    const contentData = {
      resource,
      assignment,
      course,
      userResources: course[resource] || [],
      parentResource: 'assignments',
      userId: this.props.userId,
    }
    return (
      <DashboardLayout
        routingInfo={this.props.match}
        crumbs={[
          {title: 'Profile', link: ''},
          {title: `${course.name}`, link: ''},
          {title: `${assignment.name}`, link: ''}
        ]}
        sidePanelTitle={'side panel'}
        contentData={contentData}
        tabs={this.state.tabs}
      />
    )
  }
}

const mapStateToProps = (store, ownProps ) => {
  const { assignment_id, course_id } = ownProps.match.params;
  return {
    currentAssignment: populateResource(store, 'assignments', assignment_id, ['rooms']),
    currentCourse: store.courses.byId[course_id],
    userId: store.user.id,
  }
}

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getCourses: () => dispatch(actions.getCourses()),
    getRooms: () => dispatch(actions.getRooms()),
    // updateUserCourses: newCourse => dispatch(actions.updateUserCourses(newCourse)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignment);
