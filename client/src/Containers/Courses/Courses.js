import React, { Component } from 'react';
import Link from 'react-router-dom';
class Courses extends Component {
  render() {
    const rooms = this.state.allRooms ? 'rooms' : 'myRooms';
    const roomElems = this.props[rooms].map(course => (
      <li><label>Name: </label><Link to={`/room/${course._id}`}>{course.name}</Link></li>
    ))
    return (
      <div className='container-fluid'>
        <div className='row-fluid'>
          <div className='col-md-2'>
            <label>Show my courses:</label>
            <input type='checkbox' name='showMyRooms' onClick={this.filter}/>
            <ul>
              {roomElems}
            </ul>
          </div>
          <div className='col-md-10'>
            {(this.props.match.path === '/courses/new') ? <NewUser /> : null}
          </div>
        </div>
      </div>
    )
  }
}


export default Courses;
