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
    user: undefined,
    room: undefined,
    tempUsername: '',
    errorMessage: '',
    unloading: false,
  }

  componentDidMount(){
    // window.on('beforeunload.confirm', this.confirmUnload)
    window.addEventListener("beforeunload", this.confirmUnload)
    // window.onunload = this.onUnload()
  }

  componentDidUpdate(prevProps, prevState) {
    console.log('component did update')
    // if (!prevStat.resourcesCreated this.state.)
  }

  setName = (event) => {
    this.setState({tempUsername: event.target.value, errorMessage: ''});
  }

  join = () => {
    if (this.state.tempUsername.length === 0) {
      return this.setState({errorMessage: "Please enter a username before joining"})
    }
    const { id } = this.props.match.params
    if (this.tempUsername === '') return; //@TODO Tell user to enter a name
    let sendData = {
      username: this.state.tempUsername,
      tempRoom: true,
      roomName: `temporary room ${id.slice(0, 5)}...`,
      roomId: id,
    }

    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      let room = res.room
      room.chat.push(res.message)
      this.setState({user: res.user, room: res.room})
    })

    this.socket.on('USER_JOINED', data => {
      this.updateMembers(data.currentUsers)
    })

    this.socket.on('USER_LEFT', data => {
      this.updateMembers(data.currentUsers)
    })
  }

  updateMembers = (newMembers) => {
    console.log('updating members')
    const updatedRoom = {...this.state.room};
    updatedRoom.currentUsers = newMembers;
    this.setState({room: updatedRoom})
  }

  componentWillUnmount () {
    this.leaveRoom()
    // window.removeEventListener("beforeunload", this.confirmUnload)
    window.removeEventListener("beforeunload", this.confirmUnload)
  }

  leaveRoom = () => {
    if (this.state.user) {
      // const { room, user } = {...this.state};
      // const data = {
      //   userId: user._id,
      //   roomId: this.props.match.params.id,
      //   username: user.username,
      //   roomName: room.name,
      // }
      this.socket.emit('disconnect')
      // this.socket.disconnect(data);
    }
  }
  confirmUnload = (ev) => {
    this.setState({})
    ev.preventDefault();
    // window.onbeforeunload = false
    return ev.returnValue = 'ARe you sure you want to leave';
  }

  render() {
    return (
      this.state.user ?
      <WorkspaceLayout
        members = {this.state.room.currentUsers || []}
        graph = {() => <GgbGraph room={this.state.room} socket={this.socket} user={this.state.user} />}
        chat = {() => <Chat roomId={this.state.room._id} messages={this.state.room.chat || []} socket={this.socket} user={this.state.user} />}
      /> :
      <Modal show={!this.state.user}>
        Enter a temporary username
        <TextInput change={this.setName} />
        <div>{this.state.errorMessage}</div>
        <Button click={this.join}>Join</Button>
      </Modal>
    )
  }
}

export default TempWorkspace;
