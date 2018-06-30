import React, { Component } from 'react';

class Courses extends Component {
  render() {
    const rooms = this.state.allRooms ? 'rooms' : 'myRooms';
    const roomElems = this.props[rooms].map(room => (
      <li><label>Name: </label><Link to={`/room/${room._id}`}>{room.roomName}</Link></li>
    ))
    return (
      <div className='container-fluid'>
        <div className='row-fluid'>
          <div className='col-md-2'>
            <label>Show rooms created by me:</label>
            <input type='checkbox' name='showMyRooms' onClick={this.filter}/>
            <ul>
              {roomElems}
            </ul>
          </div>
          <div className='col-md-10'>
            {(this.props.match.path === '/rooms/new') ? <NewRoom /> : null}
          </div>
        </div>
      </div>
    )
  }
}


export default Courses;
