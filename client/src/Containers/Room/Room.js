import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import Dashboard from '../../Layout/Dashboard/Dashboard';
import NewRoom from '../Create/NewRoom/NewRoom'
import BoxList from '../../Layout/BoxList/BoxList';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
// import Students from './Students/Students';
class Room extends Component {
  state = {
    activeTab: 'Summary',
    access: false,
    guestMode: false,
    currentRoom: {}, // Right now I'm just saving currentCourse is state to compare the incoming props currentRoom to look for changes -- is this a thing people do?
    tabs: [
      {name: 'Summary'},
      {name: 'Students'},
      {name: 'Grades'},
      {name: 'Insights'},
      {name:'Settings'}
    ],
  }
 // @TODO see corresponding note in Course.js
  static getDerivedStateFromProps(nextProps, prevState) {
    console.log('getting dreives state')
    const currentRoom = nextProps.currentRoom;
    const currentCourse = nextProps.currentCourse;
    if (currentRoom !== prevState.currentRoom) {
      let access = false;
      let guestMode = false;
      // let studentNotifications = 0;
      const updatedTabs = [...prevState.tabs]
      // if this room belongs to a course check course.members for permission
      if (currentRoom.course && currentCourse.members) {
        if (currentCourse.members.find(member => member.user._id === nextProps.userId)) {
          access = true;
        }
        else {
          access = true;
          guestMode = true;
        }
      }
      // if there are new notifications
      // if (currentRoom.notifications)
      return {
        tabs: updatedTabs,
        access,
        guestMode,
        currentRoom,
      }
    } else return null;
  }

  componentDidMount() {
    this.props.getCurrentRoom(this.props.match.params.room_id)
  }

  render() {
    const room = this.state.currentRoom;
    const course = this.props.currentCourse;
    switch (this.state.activeTab) {

    }
    console.log(course)
    console.log(room)
    const guestModal = this.state.guestMode ?
      <Modal show={true}>
        <p>You currently don't have access to this course. If you would like to
          reuqest access from the owner click "Join". When your request is accepted
          this course will appear in your list of courses on your dashboard.
        </p>
        <Button click={this.requestAccess}>Join</Button>
      </Modal> : null;
    const accessModal = !this.state.access ? <Modal show={true} message='Loading Room'/> : null;
    return (
      <Aux>
        {guestModal}
        {accessModal}
        <Dashboard
          title={room.name ? `Course: ${room.name}` : null}
          crumbs={[
            {title: 'Profile', link: '/dashboard'},
            {title: course.name ? course.name : null, link: `/dashboard/course/${course._id}`},
            {title: room.name ? room.name : null, link: `/dashboard/room/${room._id}`}
          ]}
          sidePanelTitle={room.name}
          // contentCreate={contentCreate}
          // content={content}
          tabs={this.state.tabs}
          activeTab={this.state.activeTab}
          activateTab={event => this.setState({activeTab: event.target.id})}
        />
      </Aux>
      )
  }
}

const mapStateToProps = store => {
  return {
    currentRoom: store.roomsReducer.currentRoom,
    currentCourse: store.coursesReducer.currentCourse,
    userId: store.userReducer.userId,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCurrentRoom: id => dispatch(actions.getCurrentRoom(id)),
    // updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    // getCurrentCourse: id => dispatch(actions.getCurrentCourse(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
