import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import * as actions from '../../../store/actions';
import WorkspaceLayout from '../../../Layout/Room/Workspace/Workspace';
import Modal from '../../../Components/UI/Modal/Modal';
import Graph from '../Graph/Graph';
import Chat from '../Chat/Chat';
class Workspace extends Component {

  state = {
    loading: true,
    currentUsers: [],
    currentRoom: {}
  }
  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  static getDerivedStateFromProps(nextProps, prevState) {
    if (Object.keys(nextProps.currentRoom).length > 0) {
      console.log(nextProps.currentRoom)
      const currentRoom = {...nextProps.currentRoom}
      currentRoom.currentUsers.push({username: nextProps.username, id: nextProps.userId})
      return {loading: false, currentRoom: currentRoom}
    } else return null;
  }

  componentDidMount() {
    this.joinRoom();
    // setup socket listeners for users entering and leaving room
    if (Object.keys(this.props.currentRoom).length === 0) {
      this.props.getCurrentRoom(this.props.match.params.room_id)
    }
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
      roomId: this.props.currentRoom._id,
      user: {_id: this.props.userId, username: this.props.username}
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
    this.socket.emit('LEAVE_ROOM', {roomId: this.props.currentRoom._id, userId: this.props.userId})
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
    let content = <Modal show={this.state.loading} message='loading...' />
    if (!this.state.loading) {
      const graph = <Graph room={this.state.currentRoom} replay={false} socket={this.socket} />;
      const chat = <Chat messages={this.state.currentRoom.chat} username={this.props.username} userId={this.props.userId} replaying={false} socket={this.socket}/>
      content = <WorkspaceLayout graph={graph} chat ={chat} userList={this.state.currentRoom.currentUsers} />
    }
    return content;
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    currentRoom: state.rooms.byId[ownProps.match.params.room_id],
    userId: state.user.id,
    username: state.user.username,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getCurrentRoom: id => dispatch(actions.getCurrentRoom(id)),
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
