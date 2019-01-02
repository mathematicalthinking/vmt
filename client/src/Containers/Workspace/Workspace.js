import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateRoom, updatedRoom, populateRoom, setRoomStartingPoint, updateUser, addChatMessage } from '../../store/actions';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import { Modal, Aux } from '../../Components';
import NewTabForm from './NewTabForm'
import socket from '../../utils/sockets';
// import Replayer from ''
class Workspace extends Component {

  state = {
    activeMember: '',
    // inControl: false, // @TODO WE ARE DUPLICATING THIS FROM THE STORE...SINGLE SOURCE OF TRUTH!
    // someoneElseInControl: false,
    referencing: false,
    showingReference: false,
    referToEl: null,
    referToCoords: null,
    referFromEl: null,
    referFromCoords: null,
    currentTab: 0,
    role: 'participant',
    creatingNewTab: false,
    activityOnOtherTabs: [],
  }

  componentDidMount() {
    this.props.updateUser({connected: socket.connected});
    this.initializeListeners();
    this.props.populateRoom(this.props.room._id)

    window.addEventListener('beforeunload', this.componentCleanup);
  }

  componentDidUpdate(prevProps, prevState) {
    // When we first the load room
    if (prevProps.room.controlledBy !== this.props.room.controlledBy) {
      this.setState({someoneElseInControl: true, inControl: false})
    }

    if (prevState.inControl && !this.state.inControl) {
      socket.emit('RELEASE_CONTROL', {user: {_id: this.props.user._id, username: this.props.user.username}, roomId: this.props.room._id}, (err, message) => {
        this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
        this.setState({activeMember: ''})
      })
    }

    if (!prevProps.user.connected && this.props.user.connected) {
      // this.initializeListeners();
    } else if (!this.props.user.connected && this.state.inControl) {
      this.toggleControl();
    }
  }

  componentWillUnmount () {
    this.componentCleanup()
    window.removeEventListener('beforeunload', this.componentCleanup);
    window.removeEventListener('resize', this.updateReference)
  }

  componentCleanup = () => {
    const { updatedRoom, room, user} = this.props;
    if (socket) {
      // @TODO RELEASE CONTROL
      socket.emit('LEAVE_ROOM', (res, err) => {
        if (err) {
          console.log('error leaving room', err);
        }
        updatedRoom(room._id, {
          currentMembers: room.currentMembers.filter(member => member._id !== user._id)
        })
      })

      // socket.disconnect()

    }
  }

  initializeListeners(){
    socket.removeAllListeners(['USER_JOINED', 'USER_LEFT', 'TOOK_CONTROL', 'RELEASED_CONTROL', 'initializeListeners'])
    console.log(socket._callbacks)
    // window.addEventListener("resize", this.updateReference);
    const { room, user} = this.props;

    if (room.controlledBy) {
      this.setState({someoneElseInControl: true, inControl: false,})
    }

    let { role } = room.members.filter(member => member.user._id === user._id)[0]
    if (role === 'facilitator') {this.setState({role: 'facilitator'})}

    // repopulate room incase things have changed since we got to the details page
    // this.props.populateRoom(room._id)
    const sendData = {
      userId: user._id,
      roomId: room._id,
      username: user.username,
      roomName: room.name,
    }
    // const updatedUsers = [...room.currentMembers, {user: {_id: user._id, username: user.username}}]
    socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      this.props.updatedRoom(room._id, {currentMembers: res.room.currentMembers})
      this.props.addChatMessage(room._id, res.message)
    })

    socket.on('USER_JOINED', data => {
      this.props.updatedRoom(room._id, {currentMembers: data.currentMembers})
      this.props.addChatMessage(room._id, data.message)
    })

    socket.on('USER_LEFT', data => {
      if (data.releasedControl) {
        this.props.updatedRoom(room._id, {controlledBy: null})
      }
      let updatedChat = [...this.props.room.chat]
      updatedChat.push(data.message)
      this.props.updatedRoom(room._id, {currentMembers: data.currentMembers})
      this.props.addChatMessage(room._id, data.message)
    })

    socket.on('TOOK_CONTROL', message => {
      this.props.addChatMessage(this.props.room._id, message)
      this.props.updatedRoom(room._id, {controlledBy: message.user._id})
    })

    socket.on('RELEASED_CONTROL', message => {
      this.props.addChatMessage(this.props.room._id, message)
      this.props.updatedRoom(room._id, {controlledBy: null})
      this.setState({activeMember: '', someoneElseInControl: false})
    })

    socket.on('disconnect', data => {
      this.props.updateUser({connected: false})
    })
  }

  createNewTab = () => {
    this.setState({creatingNewTab: true})
  }

  closeModal = () => {
    this.setState({creatingNewTab: false})
  }

  changeTab = (index) => {
    this.clearReference()
    let data = {
      user: {_id: this.props.user._id, username: this.props.user.username},
      tab: {_id: this.props.room.tabs[index]._id, name: this.props.room.tabs[index].name},
      room: this.props.room._id,
    }
    socket.emit('SWITCH_TAB', data, (res, err) => {
      if (err) {
        return console.log('something went wrong on the socket')
      }
      this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, res.message]})
    })
    let updatedTabs = this.state.activityOnOtherTabs.filter(tab => tab !== this.props.room.tabs[index]._id)
    this.setState({currentTab: index, activityOnOtherTabs: updatedTabs})
  }

  takeControl = () => {

  }

  releaseControl = () => {

  }

  requestControl = () => {

  }

  toggleControl = () => {
    let { room, user, } = this.props;

    if (!user.connected) {
      return alert('You have disconnected from the server. Check your internet connection and try refreshing the page')
    }

    if (room.controlledBy === user._id) { // Releasing control
      let message = {
        user: {_id: user._id, username: 'VMTBot'},
        room: room._id,
        text: `${user.username} released control`,
        autogenerated: true,
        messageType: 'RELEASED_CONTROL',
        timestamp: new Date().getTime(),
      }
      this.props.updatedRoom(room._id, {controlledBy: null})
      this.props.addChatMessage(room._id, message)
      socket.emit('RELEASE_CONTROL', message, (err, res) => {
        if (err) console.log(err)
      })
      clearTimeout(this.controlTimer)
    }

    // If room is controlled by someone else
    else if (room.controlledBy) {
      let message = {
        text: 'Can I take control?',
        user: {_id: user._id, username: user.username},
        room: room._id,
        timestamp: new Date().getTime()
      }
      socket.emit('SEND_MESSAGE', message, (err, res) => {
        this.props.addChatMessage(room._id, message)
      })
    } else { // We're taking control
      this.resetControlTimer();
      let message = {
        user: {_id: user._id, username: 'VMTBot'},
        room: room._id,
        text: `${user.username} took control`,
        messageType: 'TOOK_CONTROL',
        autogenerated: true,
        timestamp: new Date().getTime(),
      }
      this.props.updatedRoom(room._id, {controlledBy: user._id})
      this.props.addChatMessage(room._id, message)
      socket.emit('TAKE_CONTROL', message, (err, message) => {
          // this.scrollToBottom(); @TODO
      })
    }
  }

  resetControlTimer = () => {
    clearTimeout(this.controlTimer)
    this.controlTimer = setTimeout(() => {this.props.updatedRoom(this.props.room._id, {controlledBy: null})}, 60 * 1000)
  }

  startNewReference = () => {
    this.setState({
      referencing: true,
      showingReference: false,
      referToEl: null,
      referToCoords: null,
    })
  }

  showReference = (referToEl, referToCoords, referFromEl, referFromCoords, tab) => {
    if (tab !== this.state.currentTab) {
      alert('This reference does not belong to this tab') //@TODO HOW SHOULD WE HANDLE THIS?
    }
    else {
      this.setState({
        referToEl,
        referFromEl,
        referToCoords,
        referFromCoords,
        showingReference: true,
      })
    }
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

  addNtfToTabs = (id) => {
    this.setState({activityOnOtherTabs: [...this.state.activityOnOtherTabs, id]})
  }

  clearTabNtf = (id) => {
    this.setState({activityOnOtherTabs: this.state.activityOnOtherTabs.filter(tab => tab !== id)})
  }

  setStartingPoint = () => {
    this.props.setRoomStartingPoint(this.props.room._id)
  }

  render() {
    const { room, user } = this.props;
    return (
      <Aux>
        {/* wait for room to be populated before trying to display it */}
        {room.tabs[0].name ?<WorkspaceLayout
          activeMember={room.controlledBy}
          room={room}
          user={user}
          role={this.state.role}
          currentTab={this.state.currentTab}
          // socket={socket}
          updateRoom={this.props.updateRoom}
          updatedRoom={this.props.updatedRoom}
          // inControl={this.state.inControl}
          resetControlTimer={this.resetControlTimer}
          toggleControl={this.toggleControl}
          // someoneElseInControl={this.state.someoneElseInControl}
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
          createNewTab={this.createNewTab}
          changeTab={this.changeTab}
          addNtfToTabs={this.addNtfToTabs}
          ntfTabs={this.state.activityOnOtherTabs}
          toggleEdit={this.toggleEdit}
          editing={this.state.editing}
          setStartingPoint={this.setStartingPoint}
          // populateRoom={this.props.populateRoom}
        /> : null}
        <Modal show={this.state.creatingNewTab} closeModal={this.closeModal}>
          <NewTabForm room={room} closeModal={this.closeModal} updatedRoom={this.props.updatedRoom}/>
        </Modal>
      </Aux>
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

export default connect(mapStateToProps, {updateUser, updateRoom, updatedRoom, populateRoom, setRoomStartingPoint, addChatMessage})(Workspace);
