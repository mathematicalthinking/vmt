import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
import Students from '../Students/Students';
import Summary from '../../Layout/Room/Summary/Summary'
// import Students from './Students/Students';
class Room extends Component {
  state = {
    access: false,
    guestMode: false,
    currentRoom: {}, // Right now I'm just saving currentRoom is state to compare the incoming props currentRoom to look for changes -- is this a thing people do?
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
    const currentRoom = nextProps.currentRoom;
    if (currentRoom !== prevState.currentRoom) {
      let access = false;
      let guestMode = false;
      if (currentRoom.members) {
        if (currentRoom.members.find(member => member.user._id === nextProps.userId)) {
          access = true;
        }
        else {
          access = true;
          guestMode = true;
        }
      }
      return {
        access,
        guestMode,
        currentRoom,
      }
    } else return null;
  }

  componentDidMount() {
    if (this.props.currentRoom._id !== this.props.match.params.room_id){
      this.props.getCurrentRoom(this.props.match.params.room_id);
    }
  }

  render() {
    const room = this.state.currentRoom;
    const resource = this.props.match.params.resource;
    console.log(room)
    let content;
    switch (resource) {
      case 'summary':
        content = <Summary history={this.props.history} room={room}/>
        break;
      case 'students':
        content = <Students classList={room.members} notifications={[]}/>
      default:
    }
    const crumbs = [
      {title: 'Dashboard', link: '/dashboard/courses'},
      {title: room.name ? room.name : null, link: `/dashboard/room/${room._id}/summary`}]
    if (room.course) {crumbs.splice(1, 0, {title: room.course.name, link: `/dashboard/course/${room.course._id}/rooms`})}
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
        <DashboardLayout
          routingInfo={this.props.match}
          title={room.name ? `Course: ${room.name}` : null}
          crumbs={crumbs}
          sidePanelTitle={room.name}
          content={content}
          tabs={this.state.tabs}
          activeTab={resource}

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
