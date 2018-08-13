import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Resources from '../../Layout/Dashboard/Resources/Resources';
import Templates from '../Templates/Templates';
import { getUserResources }from '../../store/reducers/';
import { connect } from 'react-redux';

class Profile extends Component {
  state = {
    tabs: [
      {name: 'Courses'},
      {name: 'Rooms'},
      {name: 'Templates'},
      {name: 'Settings'},
    ],
  }

  componentDidMount() {
    const { userCourses } = this.props;
    let updatedTabs = [...this.state.tabs]
    const courseNotifications = userCourses.reduce((acc, course) => {
      // @TODO Only give the user notifications if they're the owner?
      acc += course.notifications.length
      return acc;
    }, 0)
    console.log(courseNotifications)
    updatedTabs[0].notifications = courseNotifications;
    this.setState({tabs: updatedTabs})
  }

  render() {
    const resource = this.props.match.params.resource;
    let content;
    console.log(resource)
    // Load content based on
    switch (resource) {
      case 'courses' : content = <Resources
        userResources={this.props.userCourses}
        resource='course'
        userId={this.props.userId}/>;
        break;
      case 'rooms' : content = <Resources
        userResources={this.props.userRooms}
        resource='room'
        userId={this.props.userId}/>;
        break;
      case 'templates' : content = <Templates />; break;
      default:
    }

    return (
      <DashboardLayout
        routingInfo={this.props.match}
        title='Profile'
        crumbs={[{title: 'Profile', link: '/profile/courses'}]}
        // sidePanelTitle={this.props.username}
        content={content}
        tabs={this.state.tabs}
      />
    )
  }
}

const mapStateToProps = store => ({
  userCourses: getUserResources(store, 'courses'),
  userRooms: getUserResources(store, 'rooms'),
  username: store.user.username,
  userId: store.user.id,
})
const mapDispatchToProps = dispatch => ({})


export default connect(mapStateToProps, mapDispatchToProps)(Profile);
