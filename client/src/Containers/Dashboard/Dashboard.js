import React, { Component } from 'react';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
// import BoxList from '../../Layout/BoxList/BoxList';
// import NewCourse from '../Create/NewCourse/NewCourse';
// import NewRoom from '../Create/NewRoom/NewRoom';
import { connect } from 'react-redux';
import { Route } from 'react-router-dom';

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
    myResources: this.props.myCourses,
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
    console.log(event.target.id)
    const resource = event.target.id.toLowerCase().substring(0, event.target.id.length - 1);
    this.setState({
      activeTab: event.target.id,
      resource,
    });
  }
  render() {
    // console.log("MYCOURSES: ",this.props.myCourses)
    // let contentList = [];
    // let contentCreate;
    // // Load content based on
    // switch (this.state.activeTab) {
    //   case 'Courses' :
    //     contentList = this.props.myCourses;
    //     contentCreate = <NewCourse />
    //     break;
    //   case 'Rooms' :
    //     contentList = this.props.myRooms;
    //     contentCreate = <NewRoom />
    //     break;
    //   default:
    // }
    // // Put content in a boxlist layout
    // let content = <BoxList list={contentList} resource={this.state.resource} notifications={true} dashboard={true}/> //IDEA what if we just connected to the boxlist to the store> instead of passing all these props just pass which list it should render
    // if (contentList.length === 0) {content = `You don't seem to have any ${this.state.resource}s yet. Click "Create" to get started`}


    return (
      <Route exact path="/dashboard/courses" render={props => (
        <DashboardLayout
          {...props}
          crumbs={this.state.crumbs}
          tabs={this.state.tabs}
          activeTab={this.state.activeTab}
          resource={this.state.resource}
          myResourceList={this.state.myResources}
          activateTab={this.activateTab}
        />)}/>

      // <DashboardLayout
      //   title='Dashboard'
      //   crumbs={[{title: 'Dashboard', link: 'dashboard'}]}
      //   resource={this.state.resource}
      //   sidePanelInfo={this.props.username}
      //   resourceList={this.state.myResources}
      //   tabs={this.state.tabs}
      //   activeTab={this.state.activeTab}
      //   activateTab={this.activateTab}
      // />
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
