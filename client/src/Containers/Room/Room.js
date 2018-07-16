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
    room: {},
    liveMode: false,
    addingTab: false,
    replayMode: false,
    replaying: false,
    replayEventIndex: 0,
    loading: true,

  }

  componentDidMount() {
    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    API.getById('room', this.props.match.params.id)
    .then(res => {
      const result = res.data.result
      this.setState({
        room: result,
        replayEventIndex: result.events.length - 1,
        loading: false,
      })
    })
    .catch(err => {
      // Handle error
    })

    // listen for users entering/leaving the room
    this.socket.on('NEW_USER', user => {
      console.log('new user joined room: ', user)
      const updatedRoom = {...this.state.room}
      const updatedUsers = {...this.state.room.currentUsers, user}
      updatedRoom.currentUsers = updatedUsers;
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
    clearInterval(this.player)
  }

  // User clickes 'enter room'
  toggleRoomEntry = () => {
    // if 'were already in the room --> leave'
    if (this.state.liveMode || this.state.replayMode) {
      console.log('leaving room')
      this.socket.emit('LEAVE_ROOM', {roomId: this.state.room._id, userId: this.props.userId})
      console.log("socket disconnected")
      const updatedRoom = {...this.state.room}
      const updatedUsers = this.state.room.currentUsers.filter(user => user.id !== this.props.userId);
      console.log(updatedUsers)
      updatedRoom.currentUsers = updatedUsers;
      this.setState({
        liveMode: false,
        replayMode: false,
        replayEventIndex: this.state.room.events.length - 1,
        room: updatedRoom,
      });

      clearInterval(this.player);
      return;
    }
    // if we're not in the room --> enter
    this.socket.on('connect', () => {
      const data = {
        room: this.props.match.params,
        user: {id: this.props.userId, name: this.props.username}
      }
      this.socket.emit('JOIN', data, () => {
        // i.e. pending, success, fail, via state
      });
      // should get the other users in the room here
    })
    const updatedRoom = {...this.state.room}
    const updatedUsers = [...this.state.room.currentUsers, {username: this.props.username, id: this.props.userId}]
    console.log(updatedUsers);
    updatedRoom.currentUsers = updatedUsers
    this.setState({
      liveMode: true,
      room: updatedRoom,
    })
  }
  editRoom = () => {

  }

  playEvents = () => {
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
  enterReplayMode = () => {
    //@TODO check if we're already replaying and then just return;
    this.setState({
      replayMode: true,
      replayEventIndex: 0,
    })
  }

  render() {
    let stats;
    const room = this.state.room;
    if (Object.keys(this.state.room).length !== 0) {
      console.log(room)

      const currentUsers = room.currentUsers.map(user => `${user.username}, `)
      // if the room object is not empty
      // prepare its stats for rendering

      stats =
      <ContentBox
        title='Room Stats'
        align='left'
        collapsible={true}
        collapsed={this.state.liveMode || this.state.replayMode}
      >
        <div><b>Name:</b> {room.roomName}</div>
        <div><b>Created by:</b> {room.creator}</div>
        <div><b>Description:</b> {room.description}</div>
        <div><b>Users in room:</b> {currentUsers}</div>
        <div><b>Chats:</b> {room.chat.length} </div>
        <div><b>Events:</b> {room.events.length} </div>
      </ContentBox>
    }
    return(
      <Aux>
        <Loading show={this.state.loading ? true : false } message='Fetching room info'/>
        <div className={[classes.Container, glb.FlexCol].join(' ')}>
          <div className={classes.Controls}>
            <Button click={this.toggleRoomEntry}>
              {(this.state.liveMode || this.state.replayMode )? 'Leave Room' : 'Enter Room'}
            </Button>
            <Button> <Link to='rooms/logs'>View Logs</Link></Button>
            <Button click={this.editRoom}>Edit</Button>
            <Button click={this.enterReplayMode}>Replayer</Button>
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
          {(this.state.liveMode || this.state.replayMode) ?
            <div className={glb.FlexRow}>
              <Workspace
                room={this.state.room}
                socket={this.socket}
                userId={this.props.userId}
                replaying={this.state.replayMode}
                eventIndex={this.state.replayEventIndex}
              />
              <Chat
                roomId={this.state.room._id}
                username={this.props.username}
                userId={this.props.userId}
                socket={this.socket}
                replaying={this.state.replayMode}
                messages={this.state.room.chat}
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
