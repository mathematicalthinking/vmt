import React, { Component } from 'react';
import Dashboard from '../../Layout/Dashboard/Dashboard';
import BoxList from '../../Layout/BoxList/BoxList';
import NewCourse from '../Create/NewCourse/NewCourse';
import NewRoom from '../Create/NewRoom/NewRoom';
import * as actions from '../../store/actions/';
import { connect } from 'react-redux';

class Profile extends Component {
  state = {
    activeTab: 'Courses',
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

  activateTab = event => {
    this.setState({activeTab: event.target.id});
  }
  render() {
    let contentList = [];
    let resource;
    let contentCreate;
    // Load content based on
    switch (this.state.activeTab) {
      case 'Courses' :
        resource = 'course';
        contentList = this.props.myCourses;
        contentCreate = <NewCourse />
        break;
      case 'Rooms' :
        contentList = this.props.myRooms;
        contentCreate = <NewRoom />
        resource = 'room';
        break;
      default:
        resource = null;
    }
    // Put content in a boxlist layout
    let content = <BoxList list={contentList} resource={resource} notifications={true}/>
    if (contentList.length === 0) {content = `You don't seem to have any ${resource}s yet. Click "Create" to get started`}


    return (
      <Dashboard
        title='Profile'
        sidePanelTitle={this.props.username}
        content={content}
        contentCreate={contentCreate}
        tabs={this.state.tabs}
        activeTab={this.state.activeTab}
        activateTab={event => this.setState({activeTab: event.target.id})}
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

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
