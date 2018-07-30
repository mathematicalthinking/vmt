import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Course from '../Course/Course';
import Room from '../Room/Room';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

class Dashboard extends Component {
  state = {
    activeTab: 'Courses',
    modalOpen: false,
    tabs: [
      {name: 'Courses', path: `/dashboard/courses`},
      {name: 'Rooms', path: `/dashboard/rooms`},
      {name: 'Templates', path: `/dashboard/templates`},
      {name: 'Settings', path: `/dashboard/settings`},
    ],
    crumbs: [{title: 'Dashboard', link: '/dashboard/courses'}],
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
    const path = this.props.match.url;
    return(
      <Switch>
        {/* Render the dashboard homepage */}
        <Route exact path={`${path}/:resource`} render={props => {
          console.log(props)
          const { resource } = props.match.params
          let resourceList = this.props.myCourses;
          if (resource === 'rooms') { resourceList = this.props.myRooms}
          return (
            <DashboardLayout
              crumbs={this.state.crumbs}
              tabs={this.state.tabs}
              resource={resource}
              resourceList={resourceList}
              loaded={true}
            />
          )}}/>
        {/* Render a Course in dashboard mode */}
        <Route path={`${path}/courses/:course_id/:resource`} render={props => {
          return (
            <Course {...props} courseId={props.match.params.course_id} crumbs={this.state.crumbs} dashboard/>
          )
        }} />
        {/* Render a Room in dashboard */}
        <Route exact path={`${path}/rooms/:room_id/:resource`} render={props => {
          console.log('')
          return (
            <Room {...props} roomId={props.match.params.room_id} crumbs={this.state.crumbs} dashboard />
          )
        }}/>
      </Switch>
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
