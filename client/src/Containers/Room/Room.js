import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Workspace from './Workspace/Workspace';
import Chat from './Chat/Chat';
import { connect } from 'react-redux';
class Room extends Component {
  state = {
    room: {},
    roomActive: false,
    addingTab: false,
  }

  componentDidMount() {
    const roomId = this.props.match.params;
    console.log(this.props.rooms)
    console.log(roomId);
    const currentRoom = this.props.rooms.find(room => {
      console.log(room._id, roomId)
      return (room._id === roomId.id)
    })
    console.log(currentRoom.tabList[0])
    this.setState({
      room: currentRoom
    })
  }

  joinRoom = () => {
    this.setState({
      roomActive: true
    })
  }
  editRoom = () => {

  }

  replayEvents = () => {

  }
  render() {
    let tabList;
    return(
      <div>
        <h3>
          {this.state.roomName}
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
            {this.state.roomActive ? <Workspace room={this.state.room}/> : null}
          </div>
          <div className='col-md-3'>
            {this.state.roomActive ?
              <Chat
                roomId={this.state.room._id}
                username={this.props.username}
                userId={this.props.userId}
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
