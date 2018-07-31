// CONSIDER RENAMING THIS WHOLE COMPONENT TO DASHBOARD
// WE WOULD WANT TO RENAME THE LAYOUT CONTAINER DASHBOARD
import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import BoxList from '../../Layout/BoxList/BoxList';
import NewResource from '../Create/NewResource/NewResource';
import NewTemplate from '../Create/NewTemplate/NewTemplate';
import { connect } from 'react-redux';

class Dashboard extends Component {
  state = {
    modalOpen: false,
    tabs: [
      {name: 'Courses'},
      {name: 'Rooms'},
      {name: 'Templates'},
      {name: 'Settings'},
    ],
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
        contentCreate = <NewResource resource='course' />
        break;
      case 'rooms' :
        contentList = this.props.myRooms;
        contentCreate = <NewResource resource='room'/>
        break;
      case 'templates' :
      console.log(this.props.myCourseTemplates)
        contentList = this.props.myCourseTemplates
        contentCreate = <NewTemplate />
      default:
    }
    // Put content in a boxlist layout
    let content = <BoxList list={contentList} resource={resource} notifications dashboard/> //IDEA what if we just connected to the boxlist to the store> instead of passing all these props just pass which list it should render
    // NB this must be a double equals below so if contentList in undefined we don't get an error
    if (contentList.length == 0) {content = `You don't seem to have any ${resource} yet. Click "Create" to get started`}


    return (
      <DashboardLayout
        routingInfo={this.props.match}
        title='Dashboard'
        crumbs={[{title: 'Dashboard', link: '/dashboard/courses'}]}
        sidePanelTitle={this.props.username}
        content={content}
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
const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
