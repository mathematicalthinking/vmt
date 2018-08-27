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
    const { courseNotifications, roomNotifications } = this.props.user;
    const updatedTabs = [...this.state.tabs]
    // if (!user.seenTour) {
    //   this.setState({touring: true})
    // }
    if (courseNotifications.access.length > 0) {
      updatedTabs[0].notifications = courseNotifications.access.length;
    }
    if (courseNotifications.newRoom.length > 0){
      updatedTabs[0].notifications += courseNotifications.newRoom.length;
    }
    if (roomNotifications.newRoom.length > 0){
      updatedTabs[1].notifications = roomNotifications.newRoom.length;
    }
    console.log(updatedTabs)
    this.setState({
      tabs: updatedTabs
    })
  }

  render() {
    const { user, match } = this.props;
    const resource = match.params.resource;
    console.log('RESOURCE: ', resource)
    let content;
    // Load content based on
    // const updatedResources = {...this.props[resource]}
    content = <Resources
      userResources={this.props[resource] || []}
      notifications={resource === 'courses' ? user.courseNotifications : user.roomNotifications}
      resource={resource}
      userId={user.id}/>
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
