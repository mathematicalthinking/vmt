import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { Route } from 'react-router-dom';
import * as actions from '../../../store/actions';
import Modal from '../../../Components/UI/Modal/Modal';
import classes from './workspace.css';
import GgbGraph from '../Graph/GgbGraph';
import DesmosGraph from '../Graph/DesmosGraph';
import Chat from '../Chat/Chat';
import Replayer from ''
import Avatar from '../../../Components/UI/Avatar/Avatar';
import ContentBox from '../../../Components/UI/ContentBox/ContentBox';
class Workspace extends Component {

  socket = io.connect(process.env.REACT_APP_SERVER_URL);
  componentDidMount() {
    const { updateRoom, room, user} = this.props;
    const sendData = {
      userId: user.id,
      roomId: room._id,
    }
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      updateRoom(room._id, res.result)
    })

    this.socket.on('USER_JOINED', data => {
      updateRoom(room._id, {currentUsers: data})
    })

    this.socket.on('USER_LEFT', data => {
      updateRoom(room._id, {currentUsers: data})
    })
  }

  componentWillUnmount () {
    const { updateRoom, room, user} = this.props;
    const data = {
      userId: user.id,
      roomId: room._id,
    }
    this.socket.emit('LEAVE', data, (res) => {
      updateRoom(room._id, {currentUsers: res.result})
      this.socket.disconnect();
    })
  }

  render() {
    const { room, user, loading, currentUsers, match } = this.props;

    return (
      <div>
        <Modal show={loading} message='loading...' />
        <div className={classes.Container}>
          <div className={classes.Graph}>
            {room.roomType === 'geogebra' ?
              <GgbGraph room={room} socket={this.socket} replay={false} userId={user.id} /> :
              <DesmosGraph room={room} socket={this.socket} replay={false} userId={user.id} />
            }
          </div>
          <div className={classes.Chat}>
            <Chat messages={room.chat || []} roomId={room._id} socket={this.socket} user={user} />
          </div>
        </div>
        {/* <Route exact path={`${match.url}`} /> */}
        <Route path={`${match.url}/replayer`} render={ () => <Replayer />}/>
        <div className={classes.CurrentUsers}>
          <ContentBox align='left'>
            <div className={classes.Container}>{currentUsers ? currentUsers.map(user =>
              <div className={classes.Avatar} key={user.username}><Avatar username={user.username} />
              </div>) : null}
            </div>
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
