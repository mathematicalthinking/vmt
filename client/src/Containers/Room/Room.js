import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
import PrivateAccessModal from '../../Components/UI/Modal/PrivateAccess';
import PublicAccessModal from '../../Components/UI/Modal/PublicAccess'
import API from '../../utils/apiRequests';
// import Students from './Students/Students';
class Room extends Component {
  state = {
    access: false,
    guestMode: true,
    currentRoom: {}, // Right now I'm just saving currentRoom is state to compare the incoming props currentRoom to look for changes -- is this a thing people do?
    tabs: [
      {name: 'Summary'},
      {name: 'Members'},
    ],
  }

  // componentDidMount() {
  //   if (!this.props.currentRoom.members){
  //     this.props.getCurrentRoom(this.props.match.params.room_id);
  //   }
  // }

  componentDidUpdate(prevProps, prevState) {

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
    const { room, match }= this.props;
    const resource = match.params.resource;
    const contentData = {
      resource,
      parentResource: 'room',
      room,
    }

    const crumbs = [
      {title: 'Profile', link: '/profile/courses'},
      {title: room.name, link: `/profile/rooms/${room._id}/summary`}]
      //@TODO DONT GET THE COURSE NAME FROM THE ROOM...WE HAVE TO WAIT FOR THAT DATA JUST GRAB IT FROM
      // THE REDUX STORE USING THE COURSE ID IN THE URL
    if (room.course) {crumbs.splice(1, 0, {title: room.course.name, link: `/profile/courses/${room.course._id}/assignments`})}

    return (
      <Aux>
        {( this.state.owner || this.state.member || (room.isPublic && this.state.guestMode)) ?
          <Aux>
            <DashboardLayout
              routingInfo={this.props.match}
              crumbs={crumbs}
              contentData={contentData}
              tabs={this.state.tabs}
              activeTab={resource}

              activateTab={event => this.setState({activeTab: event.target.id})}
            />
          </Aux> :
          (room.isPublic ? <PublicAccessModal requestAccess={this.grantPublicAccess}/> : <PrivateAccessModal requestAccess={this.requestAccess}/>)}
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => {
  return {
    room: store.rooms.byId[ownProps.match.params.room_id],
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
