import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Course from '../Course/Course';
import NewCourse from '../Create/NewCourse/NewCourse';
import NewRoom from '../Create/NewRoom/NewRoom';
import BoxList from '../../Layout/BoxList/BoxList';
import Room from '../Room/Room';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

class Dashboard extends Component {
  state = {
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
    let contentList = [];
    const resource = this.props.match.params.resource;
    console.log(resource)
    let contentCreate;
    // Load content based on
    switch (resource) {
      case 'courses' :
        contentList = this.props.myCourses;
        contentCreate = <NewCourse />
        break;
      case 'rooms' :
        contentList = this.props.myRooms;
        contentCreate = <NewRoom />
        break;
      default:
    }
    // Put content in a boxlist layout
    console.log(contentList, resource)
    let content = <BoxList list={contentList} resource={resource} notifications dashboard/> //IDEA what if we just connected to the boxlist to the store> // instead of passing all these props just pass which list it should render
    if (contentList.length === 0) {content = `You don't seem to have any ${resource}s yet. Click "Create" to get started`}
    console.log(content)

    return (
      <DashboardLayout
        routingInfo={this.props.match}
        title='Dashboard'
        crumbs={[{title: 'Dashboard', link: '/dashboard/courses'}]}
        sidePanelTitle={this.props.username}
        content={content}
        resource={resource}
        contentCreate={contentCreate}
        tabs={this.state.tabs}
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
// @TODO consider requesting the resources here instead of on Login // maybe it doesnt matter since we're just redirected here right after login
const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
