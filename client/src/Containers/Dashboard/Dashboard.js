// CONSIDER RENAMING THIS WHOLE COMPONENT TO DASHBOARD
// WE WOULD WANT TO RENAME THE LAYOUT CONTAINER DASHBOARD
import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import BoxList from '../../Layout/BoxList/BoxList';
import Templates from '../../Layout/Dashboard/Templates/Templates'
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
  // component renders it doesn't have the props from redux -- why is that? shouldn't it? --  yeah wait a second, it definitley should
  static getDerivedStateFromProps(nextProps, prevState) {
    let updatedTabs = [...prevState.tabs]
    // IDEA perhaps refactor this into a function so we don't have two if statements doing the same thing just with different resources.
    if (nextProps.myCourses) {
      let notifications = 0;
      nextProps.myCourses.forEach(course => {
        if (course.notifications) {
          notifications += course.notifications.length;
        }
      })
      updatedTabs[0].notifications = notifications;
    }
    if (nextProps.myRooms) {
      let notifications = 0;
      nextProps.myRooms.forEach(room => {
        if (room.notifications) {
          notifications += room.notifications.length;
        }
      })
      updatedTabs[1].notifications = notifications;
    }
    return {
      tabs: updatedTabs,
    }
  }

  render() {
    let contentList = [];
    const resource = this.props.match.params.resource;
    let content; let linkSuffix;
    console.log(resource)
    let contentCreate;
    // Load content based on
    switch (resource) {
      case 'courses' :
        contentList = this.props.myCourses;
        contentCreate = <NewResource resource='course' />
        linkSuffix = '/rooms';
        break;
      case 'rooms' :
        contentList = this.props.myRooms;
        contentCreate = <NewResource resource='room'/>
        linkSuffix = '/summary';
        break;
      case 'templates' :
        content = <Templates courses={this.props.myCourseTemplates} rooms={this.props.myRoomTemplates} />
      case 'settings' :
        // content = <Settings />
      default:
    }
    // NB this must be a double equals below so if contentList in undefined we don't get an error
    // @TODO redo all of this just make layout componenest like <Templates />
    if (contentList.length == 0 && content === undefined) {content = `You don't seem to have any ${resource} yet. Click "Create" to get started`}
    // Put content in a boxlist layout
    if( content === undefined ) {
      content = <BoxList list={contentList} linkPath={`/dashboard/${resource.slice(0, -1)}/`} linkSuffix={linkSuffix}  resource={resource} notifications/>
    }

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
