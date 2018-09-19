import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import * as actions from '../../store/actions';
import WorkspaceLayout from '../../Layout/Room/Workspace/Workspace';
import DesmosGraph from './DesmosGraph';
import GgbGraph from './GgbGraph';
import Chat from './Chat';
// import Replayer from ''
class Workspace extends Component {

  socket = io.connect(process.env.REACT_APP_SERVER_URL);
  componentDidMount() {
    const { updateRoom, room, user} = this.props;
    const sendData = {
      userId: user.id,
      roomId: room._id,
    }
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      // WE COULD MAKE TAKE THIS OUT OF THE CALLBACK AND UPDATE IMMEDIATELY
      // AND THEN NOTIFY THE USER OF AN ERROR ONLY IF SOMETHING GOES WRONG
      const updatedUsers = [...room.currentUsers, {_id: user.id, username: user.username}]
      updateRoom(room._id, {currentUsers: updatedUsers})
    })

    this.socket.on('USER_JOINED', data => {
      updateRoom(room._id, {currentUsers: data})
    })

    this.socket.on('USER_LEFT', data => {
      updateRoom(room._id, {currentUsers: data})
    })
  }

  componentWillUnmount () {
    const { updateRoom, room, user} = this.props;
    const data = {
      userId: user.id,
      roomId: room._id,
    }
    this.socket.emit('LEAVE', data, (res) => {
      updateRoom(room._id, {currentUsers: room.currentUsers.filter(u => u._id !== user.id)})
      this.socket.disconnect();
    })
  }

  render() {
    const { room, user } = this.props;
    return (
      <WorkspaceLayout
        graph = {room.roomType === 'geogebra' ?
          () => <GgbGraph room={room} socket={this.socket} user={user} /> :
          () => <DesmosGraph  room={room} socket={this.socket} user={user} />}
        chat = {() => <Chat roomId={room._id} message={room.chat} socket={this.socket} user={user} />}
      />
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    currentUsers: state.rooms.byId[ownProps.match.params.room_id].currentUsers,
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
