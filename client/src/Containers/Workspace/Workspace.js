import React, { Component } from 'react';
import { connect } from 'react-redux';
import io from 'socket.io-client';
import { updateRoom, updatedRoom, populateRoom } from '../../store/actions';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
// import Replayer from ''
class Workspace extends Component {

  state = {
    activeMember: '',
    inControl: false,
    someoneElseInControl: false, // ultimately we should save and fetch this from the db 
  }

  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    const { updatedRoom, room, user} = this.props;
    if (!user) {
    }

    
    // repopulate room incase things have changed since we got to the details page 
    // this.props.populateRoom(room._id)
    const sendData = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    // const updatedUsers = [...room.currentMembers, {user: {_id: user._id, username: user.username}}]
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      updatedRoom(room._id, {currentMembers: res.room.currentMembers, chat: [...this.props.room.chat, res.message]})
    })

    this.socket.on('USER_JOINED', data => {
      updatedRoom(room._id, {currentMembers: data.currentMembers})
    })

    this.socket.on('USER_LEFT', data => {
      updatedRoom(room._id, {currentMembers: data.currentMembers})
    })

    this.socket.on('TOOK_CONTROL', message => {
      this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      this.setState({activeMember: message.user._id, someoneElseInControl: true})
    })

    this.socket.on('RELEASED_CONTROL', message => {
      this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      this.setState({activeMember: '', someoneElseInControl: false})
    })

    window.addEventListener('beforeunload', this.componentCleanup);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.room.currentMembers !== this.props.room.currentMembers) {

    }
  }

  componentWillUnmount () {
    this.componentCleanup()
    window.removeEventListener('beforeunload', this.componentCleanup);
  }
  
  componentCleanup = () => {
    const { updatedRoom, room, user} = this.props;
    if (this.socket) {
      // @TODO RELEASE CONTROL
      this.socket.disconnect()
      updatedRoom(room._id, {
        currentMembers: room.currentMembers.filter(member => member.user._id !== user._id)
      })
    }
  }

  toggleControl = () => {
    // If we're taking control 
    if (!this.state.inControl) {
      this.resetControlTimer();
      // @TODO EMIT EVENT TAKING CONTROL
      this.socket.emit('TAKE_CONTROL', {user: {_id: this.props.user._id, username: this.props.user.username}, roomId: this.props.room._id}, (err, message) => {
        console.log(message)
        this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
        this.setState({activeMember: this.props.user._id,})
      })
    } else {
      this.socket.emit('RELEASE_CONTROL', {user: {_id: this.props.user._id, username: this.props.user.username}, roomId: this.props.room._id}, (err, message) => {
        this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
        this.setState({activeMember: ''})
      })
    }
    this.setState(prevState => ({
      inControl: !prevState.inControl
    }))
  }
  
  resetControlTimer = () => {
    clearTimeout(this.controlTimer)
    this.controlTimer = setTimeout(() => {this.setState({inControl: false})}, 60 * 1000)
  }

  render() {
    const { room, user } = this.props;
    console.log(room.chat)
    return (
      <WorkspaceLayout
        activeMember={this.state.activeMember}
        room={room}
        socket={this.socket}
        updateRoom={this.props.updateRoom}
        updatedRoom={this.props.updatedRoom}
        inControl={this.state.inControl}
        resetControlTimer={this.resetControlTimer}
        toggleControl={this.toggleControl}
        someoneElseInControl={this.state.someoneElseInControl}
        user={user}
      />
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




export default connect(mapStateToProps, {updateRoom, updatedRoom, populateRoom,})(Workspace);
