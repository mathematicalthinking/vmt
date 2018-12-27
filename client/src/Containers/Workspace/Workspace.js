import React, { Component } from 'react';
import { connect } from 'react-redux';
import { updateRoom, updatedRoom, populateRoom, setRoomStartingPoint } from '../../store/actions';
import WorkspaceLayout from '../../Layout/Workspace/Workspace';
import { Modal, Aux } from '../../Components';
import NewTabForm from './NewTabForm'
import socket from '../../utils/sockets';
// import Replayer from ''
class Workspace extends Component {

  state = {
    activeMember: '',
    inControl: false,
    someoneElseInControl: false,
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
    // window.addEventListener("resize", this.updateReference);
    const { updatedRoom, room, user} = this.props;
    this.props.populateRoom(room._id)

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
      updatedRoom(room._id, {currentMembers: res.room.currentMembers, chat: [...this.props.room.chat, res.message]})
    })

    socket.on('USER_JOINED', data => {
      updatedRoom(room._id, {currentMembers: data.currentMembers})
    })

    socket.on('USER_LEFT', data => {
      if (data.releasedControl) {
        this.setState({someoneElseInControl: false})
      }
      updatedRoom(room._id, {currentMembers: data.currentMembers})
    })

    socket.on('TOOK_CONTROL', message => {
      this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      this.setState({activeMember: message.user._id, someoneElseInControl: true})
    })

    socket.on('RELEASED_CONTROL', message => {
      this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      this.setState({activeMember: '', someoneElseInControl: false})
    })

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
        console.log('left room: ', res);
        updatedRoom(room._id, {
          currentMembers: room.currentMembers.filter(member => member.user._id !== user._id)
        })
      })

      // socket.disconnect()

    }
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

  toggleControl = () => {
    let { user, room } = this.props;
    // If we're taking control
    if (!this.state.inControl && !this.state.someoneElseInControl) {
      this.resetControlTimer();
      // @TODO EMIT EVENT TAKING CONTROL
      this.setState({activeMember: this.props.user._id, inControl: true})
      socket.emit('TAKE_CONTROL', {user: {_id: user._id, username: user.username}, roomId: room._id}, (err, message) => {
        this.props.updatedRoom(this.props.room._id, {chat: [...this.props.room.chat, message]})
      })
    } else if (this.state.someoneElseInControl) {
      let newMessage = {
        text: 'Can I take control?',
        user: {_id: user._id, username: user.username},
        room: room._id,
        timestamp: new Date().getTime()
      }
      socket.emit('SEND_MESSAGE', newMessage, (err, res) => {

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
    console.log('update startying point')
    this.props.setRoomStartingPoint(this.props.room._id)
  }

  render() {
    const { room, user } = this.props;
    return (
      <Aux>
        {/* wait for room to be populated before trying to display it */}
        {room.tabs[0].name ?<WorkspaceLayout
          activeMember={this.state.activeMember}
          room={room}
          user={user}
          role={this.state.role}
          currentTab={this.state.currentTab}
          socket={socket}
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

export default connect(mapStateToProps, {updateRoom, updatedRoom, populateRoom, setRoomStartingPoint})(Workspace);
