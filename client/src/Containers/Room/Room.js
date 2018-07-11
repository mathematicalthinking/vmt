import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Workspace from './Workspace/Workspace';
import Chat from './Chat/Chat';
import io from 'socket.io-client';
import Replayer from './Replayer/Replayer'
import { connect } from 'react-redux';

import API from '../../utils/apiRequests';
class Room extends Component {
  state = {
    room: {},
    roomActive: false,
    addingTab: false,
    replaying: false,
  }

  componentDidMount() {
    // get all of the information for the current room with all fields populated
    API.getById('room', this.props.match.params.id)
    .then(res => {
      console.log(res.data.result)
      this.setState({
        room: res.data.result
      })
    })
    .catch(err => {
      // Handle error
    })
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
        console.log('joined') // we should indicate the status of joining
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

  // this should be its own component
  replayEvents = () => {
    this.setState({
      replaying: true
    })
  }
  render() {
    let tabList;
    let stats;
    let description;
    // if the room object is not empty
    // prepare its stats for rendering
    if (Object.keys(this.state.room).length !== 0) {
      stats = <div>
        <span>Users in room: </span>
        <span>chats: {this.state.room.chat.length} </span>
        <span>events: {this.state.room.events.length} </span>
      </div>
      description = <p>{this.state.room.description}</p>
    }
    return(
      <div>
        <h3>
          {this.state.room.roomName}
        </h3>
        <div>
          <button id="enterRoomButton" onClick={this.joinRoom} className='btn btn-primary' style={{margin: 10}}>Enter</button>
          <Link to='rooms/logs' className='btn btn-info' style={{margin: 10}}>View Logs</Link>
          <button onClick={this.editRoom} className="btn btn-warning" style={{margin: 10}}>Edit</button>
          <button id="replayRoomButton" onClick={this.replayEvents} class="btn btn-primary" style={{margin: 10}}>Replayer</button>
        </div>
        <small className='muted'>createdBy {this.props.username}</small>
        <br/>
        {stats}
        <h4>Description</h4>
        {description}
        <strong>Tabs: </strong>
        {tabList}
        <div className='container-fluid'>
          <div className='col-md-9'>
            <div id="tabs">
              <ul>
                {tabList}
              </ul>
            </div>
            {this.state.replaying ? <Replayer /> : null}
            {/* show the workspace and chat if the rooms is active, i.e. entered */}
            {(this.state.roomActive || this.state.replaying) ?
              // we could just load this right away (instead of waiting for them to hit
              // enter) and set a prop of visible to false
                <Workspace
                  room={this.state.room}
                  socket={this.socket}
                  userId={this.props.userId}
                  events={this.state.room.events}
                  replaying={this.state.replaying}
                /> : null}
          </div>
          <div className='col-md-3'>
            {this.state.roomActive ?
              <Chat
                roomId={this.state.room._id}
                username={this.props.username}
                userId={this.props.userId}
                socket={this.socket}
                messages={this.state.room.chat}
              /> : null}
          </div>
        </div>
      </div>
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
