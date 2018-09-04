import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import * as actions from '../../../store/actions';
import WorkspaceLayout from '../../../Layout/Room/Workspace/Workspace';
import Modal from '../../../Components/UI/Modal/Modal';
import Graph from '../Graph/Graph';
import Chat from '../Chat/Chat';
class Workspace extends Component {

  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    this.props.populateRoom(this.props.room._id)
    console.log(this.props.room)
    this.joinRoom();
    // POPULATE ROOM (Event / chat history / current Members)
    // initialize the socket @IDEA consider making this its own function
    this.socket.on('NEW_USER', currentUsers => {
      const updatedRoom = {...this.props.currentRoom}
      updatedRoom.currentUsers = currentUsers;
      this.setState({
        currentRoom: updatedRoom,
      })
    })

    this.socket.on('USER_LEFT', currentUsers => {
      const updatedRoom = {...this.state.currentRoom}
      updatedRoom.currentUsers = currentUsers;
      this.setState({
        room: updatedRoom,
      })
    })
  }

  componentWillUnmount () {
    // @TODO close socket connection
    this.leaveRoom()
  }

  joinRoom = () => {
    const data = {
      roomId: this.props.room._id,
      user: {_id: this.props.user.id, username: this.props.user.username}
    }
    this.socket.emit('JOIN', data, () => {
      // check for duplicated ...sometimes is a user is left in if they dont disconnect properly
    //   const duplicate = this.props.room.currentUsers.find(user => user._id === this.props.userId)
    //   const updatedUsers = duplicate ? [...this.props.room.currentUsers] :
    //     [...this.props.room.currentUsers, {username: this.props.username, _id: this.props.userId}];
    //   this.setState(prevState => ({
    //     room: {
    //       ...prevState.room,
    //       currentUsers: updatedUsers
    //     },
    //     replayMode: false,
    //     replaying: false,
    //   }))
    })
  }


  leaveRoom = () => {
    this.socket.emit('LEAVE_ROOM', {roomId: this.props.room._id, userId: this.props.user.id})
    // remove this client from the state of current Users
  //   const updatedUsers = this.props.room.currentUsers.filter(user => user._id !== this.props.userId)
  //   this.setState({
  //     room: {
  //       ...this.state.room,
  //       currentUsers: updatedUsers,
  //     }
  //   })
  //   if (this.state.replaying) {
  //     clearInterval(this.player)
  //   }
  }


  render() {
    let content = <Modal show={this.props.loading} message='loading...' />
    if (!this.props.loading) {
      const graph = <Graph room={this.props.room} replay={false} socket={this.socket} />;
      const chat = <Chat messages={this.props.room.chat} username={this.props.username} userId={this.props.userId} replaying={false} socket={this.socket}/>
      content = <WorkspaceLayout graph={graph} chat ={chat} userList={this.props.room.currentUsers} />
    }
    return content;
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
    populateRoom: id => dispatch(actions.populateRoom(id)),
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
