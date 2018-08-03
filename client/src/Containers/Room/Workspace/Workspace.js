import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import Aux from '../../../Components/HOC/Auxil';
import Graph from '../Graph/Graph';
class Workspace extends Component {

  state = {
    loading: true,
  }

  componentDidMount() {
    console.log(this.props)
    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    this.joinRoom();
  }

  componentWillUnmount () {
    // @TODO close socket connection
    this.leaveRoom()
  }

  joinRoom = () => {
    const data = {
      roomId: this.props.room_id,
      user: {_id: this.props.userId, username: this.props.username}
    }

    this.socket.emit('JOIN', data, () => {
      // check for duplicated ...sometimes is a user is left in if they dont disconnect properly
      const duplicate = this.props.room.currentUsers.find(user => user._id === this.props.userId)
      const updatedUsers = duplicate ? [...this.props.room.currentUsers] :
        [...this.props.room.currentUsers, {username: this.props.username, _id: this.props.userId}];
      this.setState(prevState => ({
        room: {
          ...prevState.room,
          currentUsers: updatedUsers
        },
        replayMode: false,
        replaying: false,
      }))
    })
  }

  leaveRoom = () => {
    this.socket.emit('LEAVE_ROOM', {roomId: this.state.room._id, userId: this.props.userId})
    // remove this client from the state of current Users
    const updatedUsers = this.state.room.currentUsers.filter(user => user._id !== this.props.userId)
    this.setState({
      room: {
        ...this.state.room,
        currentUsers: updatedUsers,
      }
    })
    if (this.state.replaying) {
      clearInterval(this.player)
    }
  }


  render() {
    return (
      <Aux>
        <Graph room={this.props.room} replay={false}/>
        {/* <Chat /> */}
      </Aux>
    );
  }

}

const mapStateToProps = state => {
  return {
    room: state.roomsReducer.currentRoom,
  }
}

export default connect(mapStateToProps, null)(Workspace);
