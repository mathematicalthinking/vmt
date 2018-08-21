import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Resources from '../../Layout/Dashboard/Resources/Resources';
import Templates from '../Templates/Templates';
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
  }

  componentDidMount() {
    const { userCourses, seenTour } = this.props;
    if (!seenTour) {
      this.setState({touring: true})
    }
    let updatedTabs = [...this.state.tabs]
    let courseNotifications;
    if (userCourses) {
      courseNotifications = userCourses.reduce((acc, course) => {
        // @TODO Only give the user notifications if they're the owner?
        acc += course.notifications.length
        return acc;
      }, 0)
    }
    console.log(courseNotifications)
    updatedTabs[0].notifications = courseNotifications;
    this.setState({tabs: updatedTabs})
  }

  render() {
    const resource = this.props.match.params.resource;
    let content;
    console.log(resource)
    // Load content based on
    content = <Resources userResources={this.props[resource] || []} resource={resource} userId={this.props.userId}/>
    // switch (resource) {
    //   case 'courses' : content = <Resources
    //     userResources={this.props.userCourses || []}
    //     resource='course'
    //     userId={this.props.userId}/>;
    //     break;
    //   case 'rooms' : content = <Resources
    //     userResources={this.props.userRooms || []}
    //     resource='room'
    //     userId={this.props.userId}/>;
    //     break;
    //   case 'assignments' : content = <Resources />; break;
    //   default:
    // }

    return (
      // <Aux>
        <DashboardLayout
          routingInfo={this.props.match}
          title='Profile'
          crumbs={[{title: 'Profile', link: '/profile/courses'}]}
          sidePanelTitle={this.props.username}
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
  username: store.user.username,
  userId: store.user.id,
  seenTour: store.user.seenTour,
})
const mapDispatchToProps = dispatch => ({})


export default connect(mapStateToProps, mapDispatchToProps)(Profile);
