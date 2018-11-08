import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { updateRoom, updatedRoom } from '../../store/actions';
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
    const sendData = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    const updatedUsers = [...room.currentUsers, {user: {_id: user._id, username: user.username}}]
    updatedRoom(room._id, {currentUsers: updatedUsers})

    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
    })

    this.socket.on('USER_JOINED', data => {
      updatedRoom(room._id, data.currentUsers)
    })

    this.socket.on('USER_LEFT', data => {
      updatedRoom(room._id, data.currentUsers)
    })
  }

  componentWillUnmount () {
    const { updatedRoom, room, user} = this.props;
    const data = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    if (this.socket) {
      this.socket.emit('disconnect', data, (res) => {
        updatedRoom(room._id, {currentUsers: room.currentUsers.filter(u => u.user._id !== user._id)})
        // this.socket.disconnect();
      })
    }
  }

  render() {
    const { room, user } = this.props;
    return (
      <WorkspaceLayout
        members = {(room && room.currentUsers) ? room.currentUsers : []}
        graph = {room.roomType === 'geogebra' ?
          // I dont like that these need to be wrapped in functions 👇 could do
          // props.children but I like naming them.
          () => <GgbGraph room={room} socket={this.socket} user={user} updateRoom={this.props.updateRoom}/> :
          () => <DesmosGraph  room={room} socket={this.socket} user={user} />}
        chat = {() => <Chat roomId={room._id} messages={room.chat || []} socket={this.socket} user={user} />}
        description={room.description}
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




export default connect(mapStateToProps, {updateRoom, updatedRoom})(Workspace);
