import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Workspace from './Workspace/Workspace';
import Chat from './Chat/Chat';
import io from 'socket.io-client';
import { connect } from 'react-redux';
import API from '../../utils/apiRequests';
class Room extends Component {
  state = {
    room: {},
    roomActive: false,
    addingTab: false,
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

    })
    // this.setState({
    //   room: currentRoom
    // })
  }

  // User clickes 'enter room'
  joinRoom = () => {
    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    this.socket.on('connect', () => {
      console.log('connected')
      const data = {
        room: this.props.match.params,
        user: this.props.username
      }
      this.socket.emit('JOIN', data, () => {
        console.log('joined')
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

  }
  render() {
    let tabList;
    let stats;
    let description;
    // if the room object is not empty
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
            {/* show the workspace and chat if the rooms is active, i.e. entered */}
            {this.state.roomActive ?
              <Workspace
                room={this.state.room}
                socket={this.socket}
                userId={this.props.userId}
                events={this.state.room.events}
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
