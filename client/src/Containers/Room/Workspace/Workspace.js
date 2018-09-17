import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import * as actions from '../../../store/actions';
import WorkspaceLayout from '../../../Layout/Room/Workspace/Workspace';
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
      updateRoom(room._id, res.result)
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
      updateRoom(room._id, {currentUsers: res.result})
      this.socket.disconnect();
    })
  }

  render() {
    return (
      <WorkspaceLayout {...this.props} socket={this.socket} />
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
