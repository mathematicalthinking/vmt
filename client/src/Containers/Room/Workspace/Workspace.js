import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../../store/actions';
import Modal from '../../../Components/UI/Modal/Modal';
import classes from './workspace.css';
import Graph from '../Graph/Graph';
import Chat from '../Chat/Chat';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
class Workspace extends Component {

  componentDidMount() {
    const {joinRoom, room, user} = this.props;
    joinRoom(room._id, user.id, user.username)
  }

  componentWillUnmount () {
    // @TODO close socket connection
    this.leaveRoom()
  }


  leaveRoom = () => {
    this.socket.emit('LEAVE_ROOM', {roomId: this.props.room._id, userId: this.props.user.id})
  }

  componentWillReceiveProps = (nextProps) => {
    console.log("NEXTPROPS: ", nextProps)
  }


  render() {
    console.log('rendering ', this.props.room)
    const { room, user, loading, currentUsers } = this.props;

    const userList = currentUsers ? currentUsers.map(user =>
      <div key={user.username}>{user.username}</div>
    ) : [];
    console.log(userList)
    return (
      <div>
        <Modal show={loading} message='loading...' />
        <div className={classes.Container}>
          <div className={classes.Graph}>
            <Graph room={room} replay={false} />
          </div>
          <div className={classes.Chat}>
            {/* <Chat messages={room.chat} user={user}/> */}
          </div>
        </div>
        <div className={classes.CurrentUsers}>
          <ContentBox align='left'>
            <div className={classes.Container}>{userList}</div>
          </ContentBox>
        </div>
      </div>
    )
  }

}

const mapStateToProps = (state, ownProps) => {
  console.log('mapping state to props')
  console.log({...state.rooms.byId[ownProps.match.params.room_id]})
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    currentUsers: state.rooms.byId[ownProps.match.params.room_id].currentUsers,
    user: state.user,
    loading: state.loading.loading,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    joinRoom: (roomId, userId) => dispatch(actions.joinRoom(roomId, userId))
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
