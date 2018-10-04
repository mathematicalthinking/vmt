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
    console.log(event.target.value)
    this.setState({tempUsername: event.target.value})
  }

  join = () => {
    let sendData = {
      roomId: this.props.match.params.id,
      roomName: `temp room ${this.props.match.params.id}`,
      username: this.state.tempUsername,
      tempRoom: true,
    }

    console.log(sendData)
    this.socket.emit('JOIN', sendData, (room, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      this.setState({roomCreated: true, room,})

      console.log("HELLO?", room)
    })

    this.socket.on('USER_JOINED', data => {
    })

    this.socket.on('USER_LEFT', data => {
    })

}

  // componentWillUnmount () {
  //   const { updateRoom, room, user} = this.props;
  //   const data = {
  //     userId: user.id,
  //     roomId: room._id,
  //     username: user.username,
  //     roomName: room.name,
  //   }
  //   this.socket.emit('LEAVE', data, (res) => {
  //     updateRoom(room._id, {currentUsers: room.currentUsers.filter(u => u._id !== user.id)})
  //     this.socket.disconnect();
  //   })
  // }

  render() {
    const user = {_id: 'blah', username: 'whaddup'}
    return (
      this.state.room ?
      <WorkspaceLayout
        members = {[]}
        graph = {() => <GgbGraph room={this.state.room} socket={this.socket} user={user} />}
        chat = {() => <Chat roomId={this.state.room._id} messages={this.state.room.chat || []} socket={this.socket} user={user} />}
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
