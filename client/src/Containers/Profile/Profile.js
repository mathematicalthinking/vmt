import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Resources from '../../Layout/Dashboard/Resources/Resources';
// import Assignments from '../Assignments/Assignments';
import { getUserResources }from '../../store/reducers/';
import { connect } from 'react-redux';

class Profile extends Component {
  state = {
    tabs: [
      {name: 'Courses'},
      {name: 'Assignments'},
      {name: 'Rooms'},
      {name: 'Settings'},
    ],
    touring: false,
    notifications: {
      courses: [],
      rooms: [],
    },
  }

  componentDidMount() {
    const { courses, user } = this.props;
    if (!user.seenTour) {
      this.setState({touring: true})
    }
    let updatedTabs = [...this.state.tabs]
    let courseNtfs = [];
    let roomNtfs = [];
    // @TODO Only give the user memberNotifications if they're the owner?
    console.log(courses)
    if (courses) {
      courseNtfs = courses.reduce((acc, course) => {
        console.log(course.notifications)
        acc = acc.concat(course.notifications)
        return acc;
      }, [])
    }
    console.log(user.courseNotifications)
    courseNtfs = courseNtfs.concat(user.courseNotifications)
    if (courseNtfs.length > 0) updatedTabs[0].notifications = courseNtfs.length;
    this.setState({
      tabs: updatedTabs,
      notifications: {
        courses: courseNtfs,
        rooms: roomNtfs,
      }
    })
    console.log(updatedTabs)
    console.log(courseNtfs)
  }

  render() {
    const resource = this.props.match.params.resource;
    let content;
    // Load content based on
    // const updatedResources = {...this.props[resource]}
    content = <Resources userResources={this.props[resource] || []} resource={resource} userId={this.props.user.id}/>

    return (
      // <Aux>
        <DashboardLayout
          routingInfo={this.props.match}
          title='Profile'
          crumbs={[{title: 'Profile', link: '/profile/courses'}]}
          sidePanelTitle={this.props.user.username}
          content={content}
          tabs={this.state.tabs}
        />
      // </Aux>
    )
  }
}

const mapStateToProps = store => ({
  courses: getUserResources(store, 'courses'),
  rooms: getUserResources(store, 'rooms'),
  assignments: getUserResources(store, 'assignments'),
  user: store.user,
})
// const mapDispatchToProps = dispatch => ({})


export default connect(mapStateToProps, null)(Profile);
