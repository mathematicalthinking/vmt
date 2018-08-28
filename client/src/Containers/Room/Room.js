import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
import Students from '../Students/Students';
import Summary from '../../Layout/Room/Summary/Summary';
import API from '../../utils/apiRequests';
// import Students from './Students/Students';
class Room extends Component {
  state = {
    access: true,
    guestMode: false,
    currentRoom: {}, // Right now I'm just saving currentRoom is state to compare the incoming props currentRoom to look for changes -- is this a thing people do?
    tabs: [
      {name: 'Summary'},
      {name: 'Members'},
    ],
  }

  componentDidMount() {
    if (!this.props.currentRoom.members){
      this.props.getCurrentRoom(this.props.match.params.room_id);
    }
  }

  componentDidUpdate(prevProps, prevState) {


    // this.props.clearCurrentRoom()
  }

  requestAccess = () => {
    // @TODO Use redux actions to make this request
    API.requestAccess('room', this.props.match.params.room_id, this.props.userId)
    .then(res => {
      // @TODO SEND/DISPLAY CONFIRMATION somehow
      this.props.history.push('/confirmation')
    })
  }

  render() {
    const room = this.props.currentRoom;
    const resource = this.props.match.params.resource;
    let content;
    switch (resource) {
      case 'summary':
        content = <Summary history={this.props.history} room={room}/>
        break;
      case 'members':
        let owner = false;
        if (this.props.currentRoom.creator._id === this.props.userId) {
          owner = true
        }
        content = <Students classList={room.members} resource='room' resourceId={room._id} owner={owner}/>
        break;
      default:
    }
    const crumbs = [
      {title: 'Profile', link: '/profile/courses'},
      {title: room.name, link: `/profile/rooms/${room._id}/summary`}]
      //@TODO DONT GET THE COURSE NAME FROM THE ROOM...WE HAVE TO WAIT FOR THAT DATA JUST GRAB IT FROM
      // THE REDUX STORE USING THE COURSE ID IN THE URL
    if (room.course) {crumbs.splice(1, 0, {title: room.course.name, link: `/profile/courses/${room.course._id}/assignments`})}
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

const mapStateToProps = (store, ownProps) => {
  return {
    currentRoom: store.rooms.byId[ownProps.match.params.room_id],
    userId: store.user.id,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCurrentRoom: id => dispatch(actions.getCurrentRoom(id)),
    clearCurrentRoom: () => dispatch(actions.clearCurrentRoom()),
    // updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    // getCurrentCourse: id => dispatch(actions.getCurrentCourse(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
