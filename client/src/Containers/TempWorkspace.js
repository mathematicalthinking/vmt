import React, { Component } from 'react';
import io from 'socket.io-client';
import WorkspaceLayout from '../Layout/Room/Workspace/Workspace';
import DesmosGraph from './Workspace/DesmosGraph';
import GgbGraph from './Workspace/GgbGraph';
import Chat from './Workspace/Chat';
// import Replayer from ''
class TempWorkspace extends Component {

  state = {
    resourcesCreated: false,
    tempUsername: '',
  }
  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    const room = {

    }
    const sendData = {
      userId: 'autogenerate a temporary userID',
      roomId: room._id,
      username: this.state.tempusername,
      roomName: room.name,
    }
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      // WE COULD MAKE TAKE THIS OUT OF THE CALLBACK AND UPDATE IMMEDIATELY
      // AND THEN NOTIFY THE USER OF AN ERROR ONLY IF SOMETHING GOES WRONG
      // const updatedUsers = [...room.currentUsers, {_id: user.id, username: user.username}]
    })

    this.socket.on('USER_JOINED', data => {
    })

    this.socket.on('USER_LEFT', data => {
    })
  }

  componentDidUpdate(prevProps, prevState) {
    // if (!prevStat.resourcesCreated this.state.)
  }

  componentWillUnmount () {
    const { updateRoom, room, user} = this.props;
    const data = {
      userId: user.id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    this.socket.emit('LEAVE', data, (res) => {
      updateRoom(room._id, {currentUsers: room.currentUsers.filter(u => u._id !== user.id)})
      this.socket.disconnect();
    })
  }

  render() {
    const room = {_id: 'dffsdf', chat: []}
    const user = {_id: 'blah', username: 'whaddup'}
    return (
      this.state.resourcesCreated ?
      <WorkspaceLayout
        members = {[]}
        graph = {() => <GgbGraph room={room} socket={this.socket} user={user} />}
        chat = {() => <Chat roomId={room._id} messages={room.chat || []} socket={this.socket} user={user} />}
      /> : <div>Loading...Enter a temporary username</div>
    )
  }
}



export default TempWorkspace;
