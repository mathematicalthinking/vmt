import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Workspace from './Workspace/Workspace';
import Chat from './Chat/Chat';
import io from 'socket.io-client';
import Replayer from './Replayer/Replayer';
import Aux from '../../Components/HOC/Auxil';
import Button from '../../Components/UI/Button/Button';
import ContentBox from '../../Components/UI/ContentBox/ContentBox';
import Loading from '../../Components/UI/Loading/Loading';
import classes from './room.css';
import glb from '../../global.css'
import { connect } from 'react-redux';

import API from '../../utils/apiRequests';
class Room extends Component {
  state = {
    room: {
      currentUsers: [],
    },
    liveMode: false,
    addingTab: false,
    replayMode: false,
    replaying: false,
    replayEventIndex: 0,
    loadingRoom: true,
    loadingWorkspace: true,

  }

  componentDidMount() {
    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    this.joinRoom();
    // Get room info from the backend
    API.getById('room', this.props.match.params.id)
    .then(res => {
      const result = res.data.result
      this.setState({
        room: result,
        replayEventIndex: result.events.length - 1,
        loadingRoom: false,
      })
    })
    .catch(err => {
      // Handle error
    })

    // setup socket listeners for users entering and leaving room
    this.socket.on('NEW_USER', currentUsers => {
      console.log('new user joined room: ', currentUsers)
      const updatedRoom = {...this.state.room}
      updatedRoom.currentUsers = currentUsers;
      this.setState({
        room: updatedRoom,
      })
    })

    this.socket.on('USER_LEFT', currentUsers => {
      console.log("A DIFFERENT CLIENT LEFT")
      const updatedRoom = {...this.state.room}
      updatedRoom.currentUsers = currentUsers;
      this.setState({
        room: updatedRoom,
      })
    })
  }

  componentWillUnmount () {
    // @TODO close socket connection
    console.log('leaving room')
    this.leaveRoom()
  }

  updateRoom = update => {
    console.log('updating room: ', update)
    const updatedRoom = {...this.state.room}
    const resource = Object.keys(update);
    const updatedResource = [...this.state.room[resource], update[resource]]
    updatedRoom[resource] = updatedResource;
    this.setState({
      room: updatedRoom
    })
  }

  playEvents = () => {
    console.log("replaying")
    let index = this.state.replayEventIndex;
    if (index === this.state.room.events.length - 1) {
      this.setState({replaying: false, replayEventIndex: 0})
      return clearInterval(this.player)
    }
    index++;
    this.setState({
      replayEventIndex: index,
    })
  }
  // for fastforwarding rewinding
  goToEventIndex = index => {
    clearTimeout(this.player)
    console.log(index)
    // dont let the user go outside of the range of events
    if (index < 0) index = 0;
    if (index >= this.state.room.events.length) index = this.state.room.events.length - 1;
    console.log(index)
    this.setState({
      replaying: false,
      replayEventIndex: index,
    })
  }

  togglePlaying = () => {
    if (this.state.replaying) {
      this.setState({replaying: false})
      return clearInterval(this.player)
    }
    // if we're at the end, start from the beginning
    this.setState({replaying: true})
    this.player = setInterval(this.playEvents, 1000);
  }

  toggleReplayMode = () => {
    if (this.state.replayMode) {
      this.joinRoom();
      clearTimeout(this.player)
    }
    else{
      this.setState({
        replayMode: true,
        replayEventIndex: 0,
      })
      this.leaveRoom();
    }
  }

  joinRoom = () => {
    const data = {
      roomId: this.props.match.params.id,
      user: {_id: this.props.userId, username: this.props.username}
    }

    this.socket.emit('JOIN', data, () => {
      // check for duplicated ...sometimes is a user is left in if they dont disconnect properly
      const duplicate = this.state.room.currentUsers.find(user => user._id === this.props.userId)
      const updatedUsers = duplicate ? [...this.state.room.currentUsers] :
        [...this.state.room.currentUsers, {username: this.props.username, _id: this.props.userId}];
        console.log('setting replaying to false')
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
    let stats;
    const room = {...this.state.room};
    console.log(room)
    // making sure we at least two properties in room
    // this is because socket.io can get currentUsers before the api call
    // gets the rest of the information.
    if (Object.keys(this.state.room).length > 1) {
      let currentUsers;
      if (room.currentUsers.length > 0) {
        currentUsers = room.currentUsers.map(user => `${user.username}, `)
      }
      // if the room object is not empty
      // prepare its stats for rendering

      stats =
      <ContentBox
        title='Room Stats'
        align='left'
        collapsible={true}
        collapsed={this.state.liveMode || this.state.replayMode}
      >
        <div><b>Name:</b> {room.name}</div>
        <div><b>Created by:</b> {room.creator.username}</div>
        <div><b>Description:</b> {room.description}</div>
        <div><b>Users in room:</b> {currentUsers}</div>
        <div><b>Chats:</b> {room.chat.length} </div>
        <div><b>Events:</b> {room.events.length} </div>
      </ContentBox>
    }
    let showLoading = true;
    let loadingMessage = 'Fetching room info';
    if (!this.state.loadingRoom) {
      loadingMessage = 'Loading geogebra workspace...this may take a moment'
    }
    if (!this.state.loadingWorkspace) {
      showLoading = false;
    }
    return(
      <Aux>
        <Loading show={showLoading} message={loadingMessage}/>
        <div className={[classes.Container, glb.FlexCol].join(' ')}>
          <div className={classes.Controls}>
            {/* <Button click={this.toggleRoomEntry}>
              {(this.state.liveMode || this.state.replayMode )? 'Leave Room' : 'Enter Room'}
            </Button> */}
            <Button> <Link to='rooms/logs'>View Logs</Link></Button>
            <Button click={this.editRoom}>Edit</Button>
            <Button click={this.toggleReplayMode}>
              {this.state.replayMode ? 'Live Mode' : 'Replay Mode'}
            </Button>
          </div>
          <div className={glb.FlexRow}>
            <div className={classes.Stats}>
              {stats}
            </div>
            {this.state.replayMode ?
              <Replayer
                playing={this.state.replaying}
                play={this.togglePlaying}
                index={this.state.replayEventIndex}
                duration={this.state.room.events.length}
                goToIndex={this.goToEventIndex}
              /> : null}
          </div>
          {/* show the workspace and chat if the rooms is active, i.e. entered */}
          {!this.state.loadingRoom ?
            <div className={glb.FlexRow}>
              <Workspace
                room={this.state.room}
                socket={this.socket}
                userId={this.props.userId}
                replaying={this.state.replayMode}
                eventIndex={this.state.replayEventIndex}
                loaded={() => this.setState({loadingWorkspace: false})}
                updateRoom={update => this.updateRoom(update)}
              />
              <Chat
                roomId={this.state.room._id}
                username={this.props.username}
                userId={this.props.userId}
                socket={this.socket}
                replaying={this.state.replayMode}
                messages={this.state.room.chat}
                updateRoom={update => this.updateRoom(update)}
              />
            </div> : null }
        </div>
      </Aux>
      )
    }
  }

  const mapStateToProps = store => {
          return {
    username: store.userReducer.username,
    userId: store.userReducer.userId,
    rooms: store.roomsReducer.rooms,
  }
}

export default connect(mapStateToProps, null)(Room);
