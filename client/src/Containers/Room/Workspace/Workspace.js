import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import * as actions from '../../../store/actions';
import Modal from '../../../Components/UI/Modal/Modal';
import classes from './workspace.css';
import Graph from '../Graph/Graph';
import Chat from '../Chat/Chat';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
class Workspace extends Component {

  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    this.props.joinRoom(this.props.room._id, this.props.user.id, this.props.user.username)
  }

  componentWillUnmount () {
    // @TODO close socket connection
    this.leaveRoom()
  }


  leaveRoom = () => {
    this.socket.emit('LEAVE_ROOM', {roomId: this.props.room._id, userId: this.props.user.id})
  }


  render() {
    const { room, user, loading } = this.props;
    return (
      <div>
        <Modal show={loading} message='loading...' />
        <div className={classes.Container}>
          <div className={classes.Graph}>
            <Graph room={room} replay={false} />
          </div>
          <div className={classes.Chat}>
            <Chat messages={room.chat} user={user}/>
          </div>
        </div>
        <div className={classes.CurrentUsers}>
          <ContentBox align='left'>
            <div className={classes.Container}>{room.currentUsers.map(user => user.username)}</div>
          </ContentBox>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state, ownProps) => {
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    user: state.user,
    loading: state.loading.loading,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    populateRoom: id => dispatch(actions.populateRoom(id)),
    joinRoom: (roomId, userId) => dispatch(actions.joinRoom(roomId, userId))
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
