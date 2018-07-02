import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Workspace from './Workspace/Workspace';
import Chat from './Chat/Chat';
import { connect } from 'react-redux';
class Room extends Component {
  state = {
    roomName: 'room1',
    creator: 'mike',
    description:'welcome to room 1',
    roomActive: false,
    addingTab: false,
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
            {this.state.roomActive ? <Workspace roomName={this.state.roomName}/> : null}
          </div>
          <div className='col-md-3'>
            {this.state.roomActive ? <Chat user={this.props.user}/> : null}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = store => {
  return {user: store.userReducer.username}
}

const mapDispatchToProps = dispatch => {

}
export default connect(mapStateToProps, mapDispatchToProps)(Room);
