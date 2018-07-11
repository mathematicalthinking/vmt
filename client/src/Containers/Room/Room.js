import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Workspace from './Workspace/Workspace';
import Chat from './Chat/Chat';
import io from 'socket.io-client';
import { connect } from 'react-redux';
class Room extends Component {
  state = {
    room: {},
    roomActive: false,
    addingTab: false,
  }

  componentDidMount() {
    // go through all of the rooms and return the one
    // we're in
    const currentRoom = this.props.rooms.find(room => {
      return (room._id === this.props.match.params.id)
    })
    this.setState({
      room: currentRoom
    })
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
        <small className='muted'>createdBy {this.state.creator}</small>
        <br/>
        <div>
          <span>Users in room: </span>
          <span>chats: </span>
          <span>events: </span>
        </div>
        <h4>Description</h4>
        <p>{this.state.description}</p>
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
              /> : null}
          </div>
          <div className='col-md-3'>
            {this.state.roomActive ?
              <Chat
                roomId={this.state.room._id}
                username={this.props.username}
                userId={this.props.userId}
                socket={this.socket}
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

const mapDispatchToProps = dispatch => {

}
export default connect(mapStateToProps, mapDispatchToProps)(Room);
