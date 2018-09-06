import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';

import * as actions from '../../../store/actions';
import Modal from '../../../Components/UI/Modal/Modal';
import classes from './workspace.css';
import Graph from '../Graph/Graph';
import Chat from '../Chat/Chat';
import Avatar from '../../../Components/UI/Avatar/Avatar';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
class Workspace extends Component {

  componentDidMount() {
    const { updateRoom, room, user} = this.props;
    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    const data = {
      userId: user.id,
      roomId: room._id,
    }
    this.socket.emit('JOIN', data, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      console.log(res.result)
      updateRoom(room._id, res.result)
    })

    this.socket.on('USER_JOINED', data => {
      updateRoom(data.roomId, {currentUsers: data.currentUsers})
    })

    this.socket.on('USER_LEFT', data => {
      console.log("ANOTHER USER LEFT: ", data)
    })
  }

  componentWillUnmount () {
    const { updateRoom, room, user} = this.props;
    const data = {
      userId: user.id,
      roomId: room._id,
    }
    this.socket.emit('LEAVE', data, () => {
      updateRoom(room._id, user.id)
    })

  }

  render() {
    const { room, user, loading, currentUsers } = this.props;

    const userList = currentUsers ? currentUsers.map(user =>
      <div className={classes.Avatar} key={user.username}><Avatar username={user.username} /></div>
    ) : [];
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
  return {
    room: state.rooms.byId[ownProps.match.params.room_id],
    currentUsers: state.rooms.byId[ownProps.match.params.room_id].currentUsers,
    user: state.user,
    loading: state.loading.loading,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateRoom: (roomId, body) => dispatch(actions.updateRoom(roomId, body)),
  }
}



export default connect(mapStateToProps, mapDispatchToProps)(Workspace);
