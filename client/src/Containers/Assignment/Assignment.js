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

  componentDidMount() {
    const { resource } = this.props.match.params;
    if (resource === 'rooms') {
      this.fetchRooms();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const prevResource = prevProps.match.params.resource;
    const { resource } = this.props.match.params;
    if (prevResource !== resource && resource === 'rooms') {
      this.fetchRooms()
    }
  }

  fetchRooms() {
    console.log('fetching rooms')
    const { assignment, populatedAssignment } = this.props;
    if (assignment.rooms.length !== populatedAssignment.rooms.length) {
      this.props.getRooms(assignment.rooms)
    }
  }

  render() {
    const resource = this.props.match.params.resource;
    const assignment = this.props.populatedAssignment
    const course = this.props.currentCourse;
    const contentData = {
      resource,
      assignment,
      course,
      userResources: assignment[resource] || [],
      parentResource: 'assignments',
      userId: this.props.userId,
    }
    console.log(contentData)
    const crumbs = [{title: 'Profile', link: '/profile/courses'}]
    if (course) {
      crumbs.push(
        {title: `${course.name}`, link: `${crumbs[0].link}/${course._id}/assignments`},
        {title: `${assignment.name}`, link: `${crumbs[0].link}/${course._id}/assignments/${assignment._id}/details`},
      )
    } else {
      crumbs.push({title: `${assignment.name}`, link: `/profile/assignments/${assignment._id}/details`})
    }
    return (
      <DashboardLayout
        routingInfo={this.props.match}
        crumbs={crumbs}
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
    assignment: store.assignments.byId[assignment_id],
    populatedAssignment: populateResource(store, 'assignments', assignment_id, ['rooms']),
    currentCourse: store.courses.byId[course_id],
    userId: store.user.id,
  }
}

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getCourses: (ids) => dispatch(actions.getCourses(ids)),
    getRooms: (ids) => dispatch(actions.getRooms(ids)),
    // updateUserCourses: newCourse => dispatch(actions.updateUserCourses(newCourse)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Assignment);
