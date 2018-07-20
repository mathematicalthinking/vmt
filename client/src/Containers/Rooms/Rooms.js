import React, { Component } from 'react';
import NewRoom from './NewRoom/NewRoom';
import BoxList from '../../Layout/BoxList/BoxList';
import Filter from '../../Components/UI/Button/Filter/Filter';
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
    // only dispatch action if we need to
    if (!this.props.rooms.length) {
      this.props.getRooms();
    }
  }

  filter = event => {
    event.preventDefault();
    const allRooms = this.state.allRooms;
    this.setState({allRooms: !allRooms})
  }

  render() {
    const rooms = this.state.allRooms ? 'rooms' : 'myRooms';
    const list = this.props[rooms];
    return (
      <div>
        <div>
          {(this.props.match.path === '/rooms/new') ?
            <NewRoom
              createRoom={this.props.createRoom}
              userId={this.props.userId}
              updateUserRooms={this.props.updateUserRooms}
              createdNewRoom={this.props.createdNewRoom}
              createdRoomConfirm={this.props.createdRoomConfirm}
            /> : null}
        </div>
        <div>
          <div className={classes.Filters}>
            <Filter click={this.filter} on={this.state.allRooms}>
              {this.state.allRooms ? 'Show rooms created by me' : 'Show public rooms'}
            </Filter>
          </div>
          <BoxList list={list} resource='room'/>
        </div>
      </div>
    )
  }
}

// connect react functions to redux actions
const mapDispatchToProps = dispatch => {
  return {
    getRooms: () => dispatch(actions.getRooms()),
    createRoom: body => dispatch(actions.createRoom(body)),
    updateUserRooms: newRoom => dispatch(actions.updateUserRooms(newRoom)),
    createdRoomConfirm: () => dispatch(actions.createdRoomConfirmed())
  }
}

// connect redux store to react props
const mapStateToProps = store => {
  return {
    rooms: store.roomsReducer.rooms,
    myRooms: store.userReducer.myRooms,
    username: store.userReducer.username,
    userId: store.userReducer.userId,
    createdNewRoom: store.roomsReducer.createdNewRoom,
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Rooms);
