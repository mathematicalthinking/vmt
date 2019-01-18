import React, { Component } from 'react';
import { connect } from 'react-redux';
import { populateRoom, removedRoom, updatedRoom, updateRoom, addUserRooms } from '../../store/actions'
import Workspace from './Workspace';
import { Aux, TextInput, Modal, Button } from '../../Components/'
import Signup from '../Signup';
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
    console.log('temp workspace mounted')
    window.addEventListener("beforeunload", this.confirmUnload)
    // If there is no room by this id ins the user's store, then they're not the first to join
    console.log('there is no this.props.room')
    let temp = true;
    this.props.populateRoom(this.props.match.params.id, temp)
    console.log('fetching temp room by id')
    if (!this.props.room) {
      this.setState({firstEntry: false})
    }
  }

    componentDidUpdate(prevProps, prevState){
    // An already signed in user has saved the workspace
    if (this.state.saving && !prevProps.loggedIn && this.props.loggedIn) {
      this.setState({saved: true, saving: false})
    }
    // The user has signed in from this page and saved the workspace
    if (!prevProps.loggedIn && this.props.loggedIn) {
      this.setState({saved: true,})

    }
    if (prevProps.room !== this.props.room) {
      console.log("ROOOOOM: ", this.props.room )
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
    socket.emit('JOIN_TEMP', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      let { room, message } = res;
      this.props.updatedRoom(room._id, {currentMembers: room.currentMembers, members: room.members})
      if (!this.state.firstEntry) res.room.chat.push(message)
      this.setState({user: res.user, room: res.room})
    })
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.confirmUnload)
    // destroy this room from the store IF IT HASNT BEEN SAVED
    if (!this.state.saved) {
      this.props.removedRoom(this.props.match.params.id)
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
    return (this.state.user
         ? <Aux>
           {this.state.saving && !this.props.loggedIn
            ? <Modal
                show={this.state.saving}
                closeModal={() => this.setState({saving: false})}
              >
              <Signup temp user={this.state.user} room={this.props.room._id} closeModal={() => this.setState({saving: false})}/>
              </Modal>
            : null}
            <Workspace
              {...this.props}
              temp
              save = {!this.state.saved ? this.saveWorkspace : null}
            />
          </Aux>
        : <Modal show={!this.state.user}>
            {!this.props.loggedIn ?
              <Aux>
                <div>Enter a temporary username</div>
                <TextInput light change={this.setName} />
                <div>{this.state.errorMessage}</div>
              </Aux> : null
            }
            { this.state.firstEntry ?
              <div>
                <p>Select a room type </p>
                <Button data-testid='temp-desmos' m={5} click={() => this.joinRoom('desmos')}>Desmos</Button>
                <Button data-testid='temp-geogebra' m={5} click={() => this.joinRoom('geogebra')}>GeoGebra</Button>
              </div> :
              <Button m={5} click={this.joinRoom}>Join</Button>
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

export default connect(mapStateToProps, { populateRoom, removedRoom, updateRoom, updatedRoom, addUserRooms })(TempWorkspace)
