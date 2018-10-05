import React, { Component } from 'react';
import io from 'socket.io-client';
import WorkspaceLayout from '../Layout/Room/Workspace/Workspace';
import TextInput from '../Components/Form/TextInput/TextInput';
import GgbGraph from './Workspace/GgbGraph';
import Modal from '../Components/UI/Modal/Modal';
import Button from '../Components/UI/Button/Button';
import Chat from './Workspace/Chat';
// import Replayer from ''
class TempWorkspace extends Component {

  state = {
    roomCreated: false,
    room: undefined,
    tempUsername: '',
  }
  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidUpdate(prevProps, prevState) {
    // if (!prevStat.resourcesCreated this.state.)
  }

  setName = (event) => {
    this.setState({tempUsername: event.target.value})
  }

  join = () => {
    let sendData = {
      username: this.state.tempUsername,
      tempRoom: true,
      roomId: this.props.match.params.id || undefined,
    }

    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      this.setState({room: res.room,})
      this.setState({user: res.user})
      console.log("HELLO?", res.room)
      
    })

    this.socket.on('USER_JOINED', data => {
      this.updateMembers(data.currentUsers)
    })

    this.socket.on('USER_LEFT', data => {
      this.updateMembers(data.currentUsers)
    })

  }

  updateMembers = (newMembers) => {
    const updatedRoom = {...this.state.room};
    updatedRoom.currentUsers = newMembers;
    this.setState({room: updatedRoom})
  }

  componentWillUnmount () {
    const { room, user} = {...this.state};
    const data = {
      userId: user._id,
      roomId: this.props.match.params.id,
      username: user.username,
      roomName: room.name,
    }
    this.socket.disconnect(data);
    // this.socket.emit('LEAVE', data, (res) => {
    //   // updateRoom(room._id, {currentUsers: room.currentUsers.filter(u => u._id !== user._id)})
    // })
  }

  render() {
    console.log(this.props)
    console.log("ROOM: ", this.state.room)
    return (
      this.state.room ?
      <WorkspaceLayout
        members = {this.state.room.currentUsers}
        graph = {() => <GgbGraph room={this.state.room} socket={this.socket} user={this.state.user} />}
        chat = {() => <Chat roomId={this.state.room._id} messages={this.state.room.chat || []} socket={this.socket} user={this.state.user} />}
      /> :
      <Modal show={!this.state.room}>
        Enter a temporary username
        <TextInput change={this.setName} />
        <Button click={this.join}>Join</Button>
      </Modal>
    )
  }
}



export default TempWorkspace;
