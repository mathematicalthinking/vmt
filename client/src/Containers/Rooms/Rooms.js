import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import NewRoom from './NewRoom/NewRoom';
import classes from './rooms.css';
import * as actions from '../../store/actions/';
import { connect } from 'react-redux';

class Rooms extends Component {
  // local state describing which rooms should be displayed
  // all, or just the user's
  state = {
    allRooms: true,
  }
  componentDidMount() {
    this.props.getRooms()
  }

  filter = (event) => {
    this.setState({
      allRooms: !this.state.allRooms
    })
  }

  render() {
    const rooms = this.state.allRooms ? 'rooms' : 'myRooms';
    const roomElems = this.props[rooms].map(room => (
      <li><b>Name: </b><Link to={`/room/${room._id}`}>{room.roomName}</Link></li>
    ))
    return (
      <div className={classes.Container}>
        <button onClick={this.filter}>Show rooms created by me</button>
        <ul>
          {roomElems}
        </ul>
        <NewRoom />
      </div>
    )
  }
}

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getRooms: (username, password) => dispatch(actions.getRooms()),
  }
}

// connect redux store to react props
const mapStateToProps = store => {
  return {
    rooms: store.roomsReducer.rooms,
    myRooms: store.authReducer.myRooms
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Rooms);
