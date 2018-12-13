import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import DashboardLayout from '../Layout/Dashboard/Dashboard';
import { getCourses, getRooms, updateActivity, getActivities } from '../store/actions';
import { connect } from 'react-redux';
import { populateResource } from '../store/reducers';
class Activity extends Component {
  state = {
    owner: false,
    tabs: [
      {name: 'Details'},
      {name: 'Rooms'},
      {name: 'Settings'},
    ],
    // assigning: false, // this seems to be duplicated in Layout/Dashboard/MakeRooms.js
    editing: false,
  }

  componentDidMount() {
    this.props.getActivities() // WHY ARE WE DOING THIS??
    const { resource } = this.props.match.params;
    if (resource === 'rooms') {
      this.fetchRooms();
    }
    // Check ability to edit
    if (this.props.activity.creator === this.props.user._id) {
      this.setState({owner: true})
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
    const { activity, populatedActivity } = this.props;
    if (activity.rooms.length !== populatedActivity.rooms.length) {
      this.props.getRooms(activity.rooms)
    }
  }

  toggleEdit = () => {
    this.setState(prevState => ({
      editing: !prevState.editing
    }))
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
      user: this.props.user,
      owner: this.state.owner
    }
    const sidePanelData = {
      image: activity.image,
      details: {
        main: activity.name,
        secondary: activity.description,
        additional: {
          Type: activity.roomType,
        }
      },
      edit: this.state.owner ? {action: 'edit', text: 'edit activity'} : null,
    }
    
    const crumbs = [{title: 'My VMT', link: '/myVMT/courses'}]
    if (course) {
      crumbs.push(
        {title: `${course.name}`, link: `${crumbs[0].link}/${course._id}/activities`},
        {title: `${activity.name}`, link: `${crumbs[0].link}/${course._id}/activities/${activity._id}/details`},
      )
    } else {
      crumbs.push({title: `${activity.name}`, link: `/myVMT/activities/${activity._id}/details`})
    }
    return (
      <DashboardLayout
        routingInfo={this.props.match}
        crumbs={crumbs}
        sidePanelTitle={'side panel'}
        contentData={contentData}
        sidePanelData={sidePanelData}
        tabs={this.state.tabs}
        user={this.props.user}
        toggleEdit={this.toggleEdit}
        editing={this.state.editing}
        update={this.props.updateActivity}
        history={this.props.history}
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


export default connect(mapStateToProps, { getCourses, getRooms, updateActivity, getActivities })(Activity);
