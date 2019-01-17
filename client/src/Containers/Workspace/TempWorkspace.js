import React, { Component } from 'react';
import { connect } from 'react-redux';
import { populateRoom, destroyRoom, updatedRoom, updateRoom, addUserRooms } from '../../store/actions'
import io from 'socket.io-client';
import Workspace from './Workspace';
import TextInput from '../../Components/Form/TextInput/TextInput';
import GgbGraph from './GgbGraph';
import DesmosGraph from './DesmosGraph';
import Signup from '../Signup';
import Modal from '../../Components/UI/Modal/Modal';
import Button from '../../Components/UI/Button/Button';
import Aux from '../../Components/HOC/Auxil';
import Chat from './Chat';
import socket from '../../utils/sockets';
// import Replayer from ''
class TempWorkspace extends Component {

  state = {
    room: undefined,
    user: undefined,
    tempUsername: null,
    errorMessage: '',
    unloading: false,
    firstEntry: true,
    enteredRoom: false,
    saving: false,
    saved: false,
  }

  componentDidMount(){
    window.addEventListener("beforeunload", this.confirmUnload)
    // If there is no room by this id ins the user's store, then they're not the first to join
    if (!this.props.room) {
      this.setState({firstEntry: false})
      this.props.populateRoom(this.props.match.params.id)
    }
  }

  componentDidUpdate(prevProps, prevState){
    // An already signed in user has saved the workspace
    if (this.state.saving && this.props.loggedIn) {
      this.setState({saved: true, saving: false})
    }
    // The user has signed in from this page and saved the workspace
    if (!prevProps.loggedIn && this.props.loggedIn) {
      this.setState({saved: true})
    }
    // if (!prevProps.room && this.props.room) {
    // }
  }

  setName = (event) => {
    this.setState({tempUsername: event.target.value, errorMessage: ''});
  }

  joinRoom = (graphType) => {
    // Set username
    let username;
    if (this.props.loggedIn) {
      username = this.props.username;
    }
    else if (!this.state.tempUsername) {
      return this.setState({errorMessage: "Please enter a username before joining"})
    }
    else {
      username = this.state.tempUsername;
    }

    const { id } = this.props.match.params;
    let sendData = {
      username: username,
      userId: this.props.userId, // this will be undefined if they're not logged in
      tempRoom: true,
      roomName: `temporary room ${id.slice(0, 5)}...`,
      roomId: id,
      tabId: this.props.room.tabs[0]._id,
      roomType: graphType, // this wil be undefined if its not the first user in the room
      firstEntry: this.state.firstEntry
    }
    // this.setState({enteredRoom: true, graph: graphType})
    console.log("JOINING", sendData)
    socket.emit('JOIN_TEMP', sendData, (res, err) => {
        if (err) {
          console.log(err) // HOW SHOULD WE HANDLE THIS
        }
        console.log('joined temp')
        let { room, message } = res;
        this.props.updatedRoom(room._id, room)
        if (!this.state.firstEntry) res.room.chat.push(message)
        this.setState({user: res.user, room: res.room})
      })

    // this.socket.on('USER_JOINED', data => {
    //   this.updateMembers(data.currentMembers)
    // })

    // this.socket.on('USER_LEFT', data => {
    //   // let updatedChat = [...this.state.room.chat]
    //   // updatedChat.push(data.message)
    //   // // THE fact that we're setting local state and redux state here (of the same resource) seems bad
    //   // this.setState({room: updatedChat})
    //   // console.log(updatedChat)
    //   this.updateMembers(data.currentMembers)
    // })
  }

  // updateMembers = (newMembers) => {
  //   const updatedRoom = {...this.state.room};
  //   updatedRoom.currentMembers = newMembers;
  //   this.setState({room: updatedRoom})
  // }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.confirmUnload)
    // destroy this room from the store IF IT HASNT BEEN SAVED
    if (!this.state.saved) {
      this.props.destroyRoom(this.props.match.params.id)
    }
  }

  confirmUnload = (ev) => {
    if (this.state.saved) return
    ev.preventDefault();
    return ev.returnValue = 'Are you sure you want to leave';
  }

  saveWorkspace = () => {
    this.props.updateRoom(this.props.match.params.id, {tempRoom: false})
    if (this.props.loggedIn) this.props.addUserRooms(this.props.match.params.id)
    this.setState({saving: true})
  }

  render() {
    return (this.state.user ?
      <Workspace
        {...this.props}
        temp
        save = {this.saveWorkspace}

      /> :
      <Modal show={!this.state.user}>
        {!this.props.loggedIn ?
          <Aux>
            <div>Enter a temporary username</div>
            <TextInput light change={this.setName} />
            <div>{this.state.errorMessage}</div>
          </Aux> : null
        }
        { this.state.firstEntry ?
          <div>
            <Button data-testid='temp-desmos' m={5} click={() => this.joinRoom('desmos')}>Desmos</Button>
            <Button data-testid='temp-geogebra' m={5} click={() => this.joinRoom('geogebra')}>GeoGebra</Button>
          </div> :
          <Button m={5} click={() => this.join()}>Join</Button>
        }
      </Modal>
    )
  }
}

const mapStateToProps = (store, ownProps) => ({
  room: store.rooms.byId[ownProps.match.params.id],
  loggedIn: store.user.loggedIn,
  username: store.user.username,
  userId: store.user._id,
})

export default connect(mapStateToProps, { populateRoom, destroyRoom, updateRoom, updatedRoom, addUserRooms })(TempWorkspace)
