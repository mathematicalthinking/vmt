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
    referencing: false,
    showingReference: false,
    referToEl: null,
    referToCoords: null,
    referFromEl: null,
    referFromCoords: null,
  }

  socket = io.connect(process.env.REACT_APP_SERVER_URL);

  componentDidMount() {
    // window.addEventListener("resize", this.updateReference);
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

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.room.currentMembers !== this.props.room.currentMembers) {

    }

    if (prevState.inControl && !this.state.inControl) {
      this.socket.emit('RELEASE_CONTROL', {user: {_id: this.props.user._id, username: this.props.user.username}, roomId: this.props.room._id}, (err, message) => {
        this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
        this.setState({activeMember: ''})
      })
    }
  }

  componentWillUnmount () {
    this.componentCleanup()
    window.removeEventListener('beforeunload', this.componentCleanup);
    window.removeEventListener('resize', this.updateReference)
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
    let { user, room } = this.props;
    // If we're taking control 
    if (!this.state.inControl && !this.state.someoneElseInControl) {
      this.resetControlTimer();
      // @TODO EMIT EVENT TAKING CONTROL
      this.setState({activeMember: this.props.user._id, inControl: true})
      this.socket.emit('TAKE_CONTROL', {user: {_id: user._id, username: user.username}, roomId: room._id}, (err, message) => {
        this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      })
    } else if (this.state.someoneElseInControl) {
      let newMessage = {
        text: 'Can I take control?',
        user: {_id: user._id, username: user.username},
        room: room._id,
        timestamp: new Date().getTime()
      }
      this.socket.emit('SEND_MESSAGE', newMessage, (err, res) => {

      })
      this.props.updatedRoom(room._id, {chat: [...room.chat, newMessage]})
      // this.scrollToBottom(); @TODO
    }
    else {
      this.setState({
        inControl: false,
        someoneElseInControl: false,
        activeMember: '',
      })
    }
  }
  
  resetControlTimer = () => {
    clearTimeout(this.controlTimer)
    this.controlTimer = setTimeout(() => {this.setState({inControl: false})}, 60 * 1000)
  }

  startNewReference = () => {
    this.setState({
      referencing: true,
      showingReference: false,
      referToEl: null,
      referToCoords: null,
    })
  }
  
  showReference = (referToEl, referToCoords, referFromEl, referFromCoords) => {
    this.setState({
      referToEl,
      referFromEl,
      referToCoords,
      referFromCoords,
      showingReference: true, 
    })
    // get coords of referenced element,
  }
  
  clearReference = () => {
    this.setState({
      referToEl: null, 
      referFromEl: null,
      referToCoords: null, 
      referFromCoords: null,
      referencing: false, 
      showingReference: false
    })
  }

  // this shouLD BE refereNT 
  setToElAndCoords = (el, coords) => {
    if (el) {
      this.setState({
        referToEl: el,
      })
    }
    if (coords) {
      this.setState({
        referToCoords: coords,
      })
    }
  }

  // THIS SHOULD BE REFERENCE (NOT CHAT,,,CHAT CAN BE referENT TOO)
  //WE SHOULD ALSO SAVE ELEMENT ID SO WE CAN CALL ITS REF EASILY
  setFromElAndCoords = (el, coords) => {
    if (el) {
      this.setState({
        referFromEl: el,
      })
    }
    if (coords) {
      this.setState({
        referFromCoords: coords,
      })
    }
  }

  render() {
    const { room, user } = this.props;
    return (
      <WorkspaceLayout
        activeMember={this.state.activeMember}
        room={room}
        user={user}
        socket={this.socket}
        updateRoom={this.props.updateRoom}
        updatedRoom={this.props.updatedRoom}
        inControl={this.state.inControl}
        resetControlTimer={this.resetControlTimer}
        toggleControl={this.toggleControl}
        someoneElseInControl={this.state.someoneElseInControl}
        startNewReference={this.startNewReference}
        referencing={this.state.referencing}
        showReference={this.showReference}
        showingReference={this.state.showingReference}
        clearReference={this.clearReference}
        referToEl={this.state.referToEl}
        referToCoords={this.state.referToCoords}
        referFromCoords={this.state.referFromCoords}
        referFromEl={this.state.referFromEl}
        setToElAndCoords={this.setToElAndCoords}
        setFromElAndCoords={this.setFromElAndCoords}
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
