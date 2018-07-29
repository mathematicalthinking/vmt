import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
// import BoxList from '../../Layout/BoxList/BoxList';
// import NewCourse from '../Create/NewCourse/NewCourse';
// import NewRoom from '../Create/NewRoom/NewRoom';
import { connect } from 'react-redux';

class Dashboard extends Component {
  state = {
    activeTab: 'Courses',
    modalOpen: false,
    tabs: [
      {name: 'Courses'},
      {name: 'Rooms'},
      {name: 'Templates'},
      {name: 'Settings'},
    ],
    crumbs: [{title: 'Dashboard', link: 'dashbaord'}],
    resource: 'course',
  }
  // I seem to be over using this lifeCycle hook
  // The problem I'm facing is that the first time this
  // component renders it doesn't have the props from redux -- why is that? shouldn't it?
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.myCourses) {
      let notifications = 0;
      nextProps.myCourses.forEach(course => {
        if (course.notifications) {
          notifications += course.notifications.length;
        }
      })
      const updatedTabs = [...prevState.tabs];
      updatedTabs[0].notifications = notifications;
      return {
        tabs: updatedTabs,
      }
    }
  }

  render() {
    console.log('rendering dashboard container')
    let resources = this.props.match.params.resource;
    let resource = resources.substring(0, resources.length - 1);
    let resourceList = this.props.myCourses
    if (resources === 'rooms') { resourceList = this.props.myRooms}
    console.log('re rendering Dashboard container')
    return (
      <DashboardLayout
        crumbs={this.state.crumbs}
        tabs={this.state.tabs}
        activeTab={resources}
        resource={resource}
        resourceList={resourceList}
      />
    )
  }
}

const mapStateToProps = store => {
  const user = store.userReducer;
  return {
    myRooms: user.myRooms,
    rooms: store.roomsReducer.rooms,
    myCourses: user.myCourses,
    myCourseTemplates: user.myCourseTemplates,
    myRoomTemplates: user.myRoomTemplates,
    username: user.username
  }
}
const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
