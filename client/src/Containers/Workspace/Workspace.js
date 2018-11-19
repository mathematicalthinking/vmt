import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { updateRoom, updatedRoom, populateRoom } from '../../store/actions';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import DesmosGraph from './DesmosGraph';
import GgbGraph from './GgbGraph';
import Chat from './Chat';
// import Replayer from ''
class Workspace extends Component {

  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    const { updatedRoom, room, user} = this.props;
    if (!user) {
    }

    
    // repopulate room incase things have changed since we got to the details page 
    // this.props.populateRoom(room._id)
    const sendData = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    // const updatedUsers = [...room.currentMembers, {user: {_id: user._id, username: user.username}}]
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      console.log("res from join: ", res)
      updatedRoom(room._id, {currentMembers: res.room.currentMembers})
    })

    this.socket.on('USER_JOINED', data => {
      updatedRoom(room._id, {currentMembers: data.currentMembers})
    })

    this.socket.on('USER_LEFT', data => {
      updatedRoom(room._id, {currentMembers: data.currentMembers})
    })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.room.currentMembers !== this.props.room.currentMembers) {
      console.log('current members have changed', this.props.room.currentMembers)
    }
  }

  componentWillUnmount () {
    const { updatedRoom, room, user} = this.props;
    if (this.socket) {
      this.socket.disconnect()
      updatedRoom(room._id, {
        currentMembers: room.currentMembers.filter(member => member.user._id !== user._id)
      })
    }
  }

  render() {
    const { room, user } = this.props;
    return (
      <WorkspaceLayout
        members = {(room && room.currentMembers) ? room.currentMembers : []}
        graph = {room.roomType === 'geogebra' ?
          () => <GgbGraph room={room} socket={this.socket} user={user} updateRoom={this.props.updateRoom}/> :
          () => <DesmosGraph  room={room} socket={this.socket} user={user} />}
        chat = {() => <Chat roomId={room._id} messages={room.chat || []} socket={this.socket} user={user} />}
        description={room.description}
        instructions={room.instructions}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    user: state.user,
    loading: state.loading.loading,
  }
}




export default connect(mapStateToProps, {updateRoom, updatedRoom, populateRoom,})(Workspace);
