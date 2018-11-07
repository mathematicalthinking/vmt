import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import * as actions from '../../store/actions';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import DesmosGraph from './DesmosGraph';
import GgbGraph from './GgbGraph';
import Chat from './Chat';
// import Replayer from ''
class Workspace extends Component {

  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    const { updateRoom, room, user} = this.props;
    if (!user) {
    }
    const sendData = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      // WE COULD MAKE TAKE THIS OUT OF THE CALLBACK AND UPDATE IMMEDIATELY
      // AND THEN NOTIFY THE USER OF AN ERROR ONLY IF SOMETHING GOES WRONG
      const updatedUsers = [...room.currentUsers, {_id: user._id, username: user.username}]
      updateRoom(room._id, {currentUsers: updatedUsers})
    })

    this.socket.on('USER_JOINED', data => {
      updateRoom(room._id, {currentUsers: data.currentUsers})
    })

    this.socket.on('USER_LEFT', data => {
      updateRoom(room._id, {currentUsers: data.currentUsers})
    })
  }

  componentWillUnmount () {
    const { updateRoom, room, user} = this.props;
    const data = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    if (this.socket) {
      this.socket.emit('LEAVE', data, (res) => {
        updateRoom(room._id, {currentUsers: room.currentUsers.filter(u => u._id !== user._id)})
        this.socket.disconnect();
      })
    }
  }

  render() {
    const { room, user } = this.props;
    return (
      <WorkspaceLayout
        members = {room ? room.currentUsers : []}
        graph = {room.roomType === 'geogebra' ?
          // I dont like that these need to be wrapped in functions 👇 could do
          // props.children but I like naming them.
          () => <GgbGraph room={room} socket={this.socket} user={user} /> :
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

const mapDispatchToProps = dispatch => {
  return {
    updateRoom: (roomId, body) => dispatch(actions.updateRoom(roomId, body)),
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
