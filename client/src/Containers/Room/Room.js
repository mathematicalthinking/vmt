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
    tabs: [
      {name: 'Summary'},
      {name: 'Members'},
    ],
  }

  initialTabs = [
    {name: 'Activities'},
    {name: 'Rooms'},
    {name: 'Members'},
  ]

  componentDidMount() {
    console.log("COMPONENT DID MOUNT ")
    const { room, user, members, populateRoom } = this.props;
    // CHECK ACCESS
    let updatedTabs = [...this.state.tabs];
    let owner = false;
    let member = false;
    if (room.creator === user.id) {
      updatedTabs = updatedTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}]);
      this.initialTabs.concat([{name: 'Grades'}, {name: 'Insights'}, {name:'Settings'}])
      owner = true;
    }
    if (members) {
      console.log(members)
      console.log(user.id)
      if (members.find(member => member.user._id === user.id)) member = true;
    }
    if (!room.events) {
      populateRoom(room._id)
    }
    // Get Any other notifications
    this.setState({
      tabs: updatedTabs,
      owner,
      member,
    })

  }

  componentDidUpdate(prevProps, prevState) {

    console.log("PROPS UPDAYED ADDED A NEW MEMBER")
    console.log({...prevProps}, {...this.props})
    console.log(prevProps.room.members.length)
    console.log(this.props.room.members.length)
    if (prevProps.room.members.length !== this.props.room.members.length) {
      this.checkAccess();
    }
  }

  checkAccess () {
    if (this.props.room.members.find(member => member.user._id === this.props.user.id)) {
      this.setState({member: true})
    };

  }

  requestAccess = entryCode => {
    const {room, user} = this.props;
    console.log(user, room._id)
    console.log("ENTRY CODE: ", entryCode)
    this.props.requestAccess(user, 'room', room._id, entryCode)
  }


  render() {
    const { room, match, user } = this.props;
    const resource = match.params.resource;
    const contentData = {
      resource,
      parentResource: 'room',
      parentResourceId: room._id,
      userResources: room[resource],
      owner: this.state.owner,
      notifications: user.roomNotifications || [],
      room,
    }
    console.log(contentData)

    const crumbs = [
      {title: 'Profile', link: '/profile/courses'},
      {title: room.name, link: `/profile/rooms/${room._id}/summary`}]
      //@TODO DONT GET THE COURSE NAME FROM THE ROOM...WE HAVE TO WAIT FOR THAT DATA JUST GRAB IT FROM
      // THE REDUX STORE USING THE COURSE ID IN THE URL
    if (room.course) {crumbs.splice(1, 0, {title: room.course.name, link: `/profile/courses/${room.course._id}/activities`})}

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
              loading={this.props.loading}
              activateTab={event => this.setState({activeTab: event.target.id})}
            />
          </Aux> :
          (room.isPublic ? <PublicAccessModal requestAccess={this.grantPublicAccess}/> : <PrivateRoomAccessModal requestAccess={(entryCode) => this.requestAccess(entryCode)} course={room.course}/>)}
      </Aux>
    )
  }
}

const mapStateToProps = (store, ownProps) => {
  console.log({...store.rooms.byId[ownProps.match.params.room_id]})
  return {
    room: store.rooms.byId[ownProps.match.params.room_id],
    // EVEN THOUGH MEMBERS IS INCLUDED IN ROOM, WE GRAB IT SEPARATELY
    // SO THAT CONNECT() UPDATES PROPS CORRECTLY -- I FEEL LIKE SOMETHING IS WRONG HERE
    // IF WE"RE MAKING A COPY OF STATE IN THE REDUCER WE SHOULDN"T HAVE TO DO THIS
    user: store.user,
    loading: store.loading.loading,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    requestAccess: (user, resource, id, entryCode) => dispatch(actions.requestAccess(null, user, resource, id, entryCode)),
    populateRoom: id => dispatch(actions.populateRoom(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Room);
