import React, { Component } from 'react';
import { Link } from 'react-router-dom';
class Room extends Component {
  state = {
    roomName: 'room1',
    creator: 'mike',
    description:'welcome to room 1',
    roomActive: false,
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
    let geogebraWorkSpace = this.state.roomActive ?
    <iframe
      height={400}
      width={600}
      title={this.state.roomName}
      id={`fragment-${this.state.roomName}`}
      src={`ggb/`}>
    </iframe> : null;
      return(
      <div>
      <h3>
      {this.state.roomName}
      <small>
      <button id="enterRoomButton" onClick={this.joinRoom} className="btn btn-primary">Enter</button>
      <Link to='rooms/logs' className='btn btn-info'>View Logs</Link>
      <button onClick={this.editRoom} className="btn btn-warning">Edit</button>
      <button id="replayRoomButton" onClick={this.replayEvents} class="btn btn-primary">Replayer</button>
      </small>
      </h3>
      <small className='muted'>createdBy {this.state.creator}</small>
      <br/>
      <div>Users in room</div>
      <div>chat count</div>
      <div>event count</div>
      <h4>Description</h4>
      <p>{this.state.description}</p>
      <strong>Tabs: </strong>
      {tabList}
      <div className='container-fluid'>
      <div id="tabs">
      <ul>
      {tabList}
      </ul>
      </div>
      {geogebraWorkSpace}
      </div>
      </div>

      )
  }
}

export default Room;
