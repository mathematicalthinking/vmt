import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
import * as actions from '../store/actions';
import { connect } from 'react-redux';
import { populateResource } from '../store/reducers';
class Activity extends Component {
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
    const { activity, populatedActivity } = this.props;
    if (activity.rooms.length !== populatedActivity.rooms.length) {
      this.props.getRooms(activity.rooms)
    }
  }

  render() {
    const resource = this.props.match.params.resource;
    const activity = this.props.populatedActivity
    const course = this.props.currentCourse;
    const contentData = {
      resource,
      activity,
      course,
      userResources: activity[resource] || [],
      parentResource: 'activities',
      parentResourceId: activity._id,
      notifications: [],
      userId: this.props.userId,
    }
    console.log(contentData)
    const crumbs = [{title: 'Profile', link: '/profile/courses'}]
    if (course) {
      crumbs.push(
        {title: `${course.name}`, link: `${crumbs[0].link}/${course._id}/activities`},
        {title: `${activity.name}`, link: `${crumbs[0].link}/${course._id}/activities/${activity._id}/details`},
      )
    } else {
      crumbs.push({title: `${activity.name}`, link: `/profile/activities/${activity._id}/details`})
    }
    return (
      <DashboardLayout
        routingInfo={this.props.match}
        crumbs={crumbs}
        sidePanelTitle={'side panel'}
        contentData={contentData}
        tabs={this.state.tabs}
        user={this.props.user}
      />
    )
  }
}

const mapStateToProps = (store, ownProps ) => {
  const { activity_id, course_id } = ownProps.match.params;
  return {
    activity: store.activities.byId[activity_id],
    populatedActivity: populateResource(store, 'activities', activity_id, ['rooms']),
    currentCourse: store.courses.byId[course_id],
    userId: store.user._id,
    user: store.user,
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

export default connect(mapStateToProps, mapDispatchToProps)(Activity);
