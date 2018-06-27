import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NewRoom from './NewRoom/NewRoom';
import classes from './rooms.css';
import api from '../../utils/apiRequests';
class Rooms extends Component {

  state = {
    rooms: []
  }

  componentDidMount() {
    api.getRooms()
    .then(result => {
      this.setState({rooms: result})
    })
  }

  filter = () => {

  }

  render() {
    const roomElems = this.state.rooms.map(room => (
      <li><b>Name: </b><Link to={`/room/${room._id}`}>{room.roomName}</Link></li>
    ))
    return (
      <div className={classes.Container}>
        <ul>
          {roomElems}
        </ul>
        <NewRoom />
      </div>
    )
  }
}

export default Rooms;
