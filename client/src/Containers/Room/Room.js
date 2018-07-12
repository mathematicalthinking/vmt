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
    roomActive: false,
    addingTab: false,
    replayMode: false,
    replaying: false,
    replayEventIndex: 0,
    loading: true,

  }

  componentDidMount() {
    // get all of the information for the current room with all fields populated
    ///@TODO this takes a little too long to display the name -- we should grab the name
    // from the props.room by filtering it for the id in the url param
    API.getById('room', this.props.match.params.id)
    .then(res => {
      const result = res.data.result
      this.setState({
        room: result,
        replayEventIndex: result.events.length - 1,
        loading: false,
      })
      // should we save the room's events array in the redux store so it can be accessed
      // by both the Workspace and the Replayer components
      // or is it fins keeping it in the room state and passing it as props
    })
    .catch(err => {
      // Handle error
    })

  }

  componentWillUnmount () {
    clearInterval(this.player)
  }

  // User clickes 'enter room'
  joinRoom = () => {
    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    this.socket.on('connect', () => {
      const data = {
        room: this.props.match.params,
        user: this.props.username
      }
      this.socket.emit('JOIN', data, () => {
        // i.e. pending, success, fail, via state
      });
      // should get the other users in the room here
    })
    this.setState({
      roomActive: true
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
    // if the room object is not empty
    // prepare its stats for rendering
    if (Object.keys(this.state.room).length !== 0) {
      stats = <ContentBox title='Room Stats' align='left'>
        <div><b>Name:</b> {this.state.room.roomName}</div>
        <div><b>Created by:</b> {this.state.room.creator}</div>
        <div><b>Description:</b> {this.state.room.description}</div>
        <div><b>Users in room:</b> </div>
        <div><b>Chats:</b> {this.state.room.chat.length} </div>
        <div><b>Events:</b> {this.state.room.events.length} </div>
      </ContentBox>
    }
    return(
      <Aux>
        <Loading show={this.state.loading ? true : false }/>
        <div className={[classes.Container, glb.FlexCol].join(' ')}>
          <div className={classes.Controls}>
            <Button click={this.joinRoom}>Enter</Button>
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
          {(this.state.roomActive || this.state.replayMode) ?
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
