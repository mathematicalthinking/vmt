import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../store/actions/';
import DashboardLayout from '../../Layout/Dashboard/Dashboard';
import Aux from '../../Components/HOC/Auxil';
import PrivateRoomAccessModal from '../../Components/UI/Modal/PrivateRoomAccess';
import PublicAccessModal from '../../Components/UI/Modal/PublicAccess'
// import Students from './Students/Students';
class Room extends Component {
  state = {
    owner: false,
    member: false,
    guestMode: true,
    currentRoom: {}, // Right now I'm just saving currentRoom is state to compare the incoming props currentRoom to look for changes -- is this a thing people do?
    tabs: [
      {name: 'Summary'},
      {name: 'Members'},
    ],
  }

  initialTabs = [
    {name: 'Assignments'},
    {name: 'Rooms'},
    {name: 'Members'},
  ]

  componentDidMount() {
    // @TODO ? DO WE NEED TO CHECK IF WE NEED ADDITIONAL DATA?
    const { room, user } = this.props;
    // CHECK ACCESS
    let updatedTabs = [...this.state.tabs];
    let owner = false;
    let member = false;
    if (room.creator === user.id) {
      updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}]);
      this.initialTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}])
      owner = true;
    }
    if (room.members) {
      if (room.members.find(member => member.user._id === user.id)) member = true;
    }
    // Get Any other notifications
    this.setState({
      tabs: updatedTabs,
      owner,
      member,
    })

  }

  componentDidUpdate(prevProps, prevState) {
    console.log("COMPONENT UPDATED")
    if (prevProps.room.members.length !== this.props.room.members.length) {
      console.log("CHECKIN ACCESS")
      this.checkAccess();
    }
  }

  checkAccess () {
    console.log(this.props.user.id)
    console.log(this.props.room.members)
    console.log(this.props.room.members.find(member => member.user._id === this.props.user.id))
    if (this.props.room.members.find(member => member.user._id === this.props.user.id)) {
      console.log('setting state')
      this.setState({member: true})
    };

  }

  requestAccess = entryCode => {
    const {room, user} = this.props;
    console.log(entryCode)
    this.props.requestAccess(user.id, 'room', room._id, entryCode)
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
          (room.isPublic ? <PublicAccessModal requestAccess={this.grantPublicAccess}/> : <PrivateRoomAccessModal requestAccess={(entryCode) => this.requestAccess(entryCode)} course={room.course}/>)}
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => {
  return {
    room: store.rooms.byId[ownProps.match.params.room_id],
    user: store.user,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCurrentRoom: id => dispatch(actions.getCurrentRoom(id)),
    clearCurrentRoom: () => dispatch(actions.clearCurrentRoom()),
    requestAccess: (user, resource, id, entryCode) => dispatch(actions.requestAccess(null, user, resource, id, entryCode)),

    // updateCourseRooms: room => dispatch(actions.updateCourseRooms(room)),
    // getCurrentCourse: id => dispatch(actions.getCurrentCourse(id)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
