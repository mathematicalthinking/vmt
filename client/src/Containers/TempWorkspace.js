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
    tempUsername: '',
  }
  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    // Check if this room already exists
    // IF YES --- wait to join
    // IF NO --- create
    const room = {

    }
    // const
      // WE COULD MAKE TAKE THIS OUT OF THE CALLBACK AND UPDATE IMMEDIATELY
      // AND THEN NOTIFY THE USER OF AN ERROR ONLY IF SOMETHING GOES WRONG
      // const updatedUsers = [...room.currentUsers, {_id: user.id, username: user.username}]


  }

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
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      this.setState({roomCreated: true})
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
    const room = {_id: 'dffsdf', chat: []}
    const user = {_id: 'blah', username: 'whaddup'}
    return (
      this.state.resourcesCreated ?
      <WorkspaceLayout
        members = {[]}
        graph = {() => <GgbGraph room={room} socket={this.socket} user={user} />}
        chat = {() => <Chat roomId={room._id} messages={room.chat || []} socket={this.socket} user={user} />}
      /> :
      <Modal show={!this.state.resourcesCreated}>
        Enter a temporary username
        <TextInput change={this.setName} />
        <Button click={this.join}>Join</Button>
      </Modal>
    )
  }
}



export default TempWorkspace;
