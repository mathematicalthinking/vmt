import React, { Component } from 'react';
import { connect } from 'react-redux';
import { populateRoom, destroyRoom, updatedRoom, updateRoom, addUserRooms } from '../store/actions'
import io from 'socket.io-client';
import WorkspaceLayout from '../Layout/Workspace/Workspace';
import TextInput from '../Components/Form/TextInput/TextInput';
import GgbGraph from './Workspace/GgbGraph';
import DesmosGraph from './Workspace/DesmosGraph';
import Signup from './Signup';
import Modal from '../Components/UI/Modal/Modal';
import Button from '../Components/UI/Button/Button';
import Aux from '../Components/HOC/Auxil';
import Chat from './Workspace/Chat';
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
    } 
  }

  componentDidUpdate(prevProps, prevState){
    if (this.state.saving && this.props.loggedIn) {
      this.setState({saved: true, saving: false})
    }
  }

  setName = (event) => {
    this.setState({tempUsername: event.target.value, errorMessage: ''});
  }

  join = (graphType) => {
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
      roomType: graphType, // this wil be undefined if its not the first user in the room
      firstEntry: this.state.firstEntry
    }
    // this.setState({enteredRoom: true, graph: graphType})

    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    this.socket.emit('JOIN_TEMP', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      console.log(res)
      let { room, user, message } = res;
      console.log(room)
      console.log(user)
      console.log(message)
      this.props.updatedRoom(room._id, room)
      if (!this.state.firstEntry) res.room.chat.push(message)
      this.setState({user: res.user, room: res.room})
    })

    this.socket.on('USER_JOINED', data => {
      this.updateMembers(data.currentMembers)
    })

    this.socket.on('USER_LEFT', data => {
      this.updateMembers(data.currentMembers)
    })
  }

  updateMembers = (newMembers) => {
    const updatedRoom = {...this.state.room};
    updatedRoom.currentMembers = newMembers;
    this.setState({room: updatedRoom})
  }

  componentWillUnmount () {
    window.removeEventListener("beforeunload", this.confirmUnload)
    if (this.socket) {
      this.socket.disconnect()
      // this.socket.emit('disconnect')
    }
    // destroy this room from the store IF IT HASNT BEEN SAVED
    if (!this.state.saved) {
      this.props.destroyRoom(this.props.match.params.id)
    }
    window.removeEventListener("beforeunload", this.confirmUnload)
  }

  confirmUnload = (ev) => {
    if (this.state.saved) return
    ev.preventDefault();
    return ev.returnValue = 'Are you sure you want to leave';
  }

  saveWorkSpace = () => {
    // if (this.props.loggedIn) return this.join()
    this.props.updateRoom(this.props.match.params.id, {tempRoom: false})
    if (this.props.loggedIn) this.props.addUserRooms(this.props.match.params.id)
    this.setState({saving: true})
  }

  render() {
    return (this.state.user ?
      <Aux>
        {this.state.saving && !this.props.loggedIn ? <Modal 
          show={this.state.saving} 
          closeModal={() => this.setState({saving: false})}
        >
          <Signup temp user={this.state.user} room={this.props.room._id} closeModal={() => this.setState({saving: false})}/>
        </Modal> : null}
        <WorkspaceLayout
          temp
          saved={this.state.saved}
          loggedIn={this.props.loggedIn}
          save={this.saveWorkSpace}
          members = {this.state.room.currentMembers || []}
          graph = {this.props.room.roomType === 'geogebra' ? 
            () => <GgbGraph room={this.state.room} socket={this.socket} user={this.state.user} tempRoom/> :
            () => <DesmosGraph room={this.state.room} socket={this.socket} user={this.state.user}/>
          }
          chat = {() => <Chat roomId={this.state.room._id} messages={this.state.room.chat || []} socket={this.socket} user={this.state.user} />}
        />
      </Aux> :
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
            <Button data-testid='temp-desmos' m={5} click={() => this.join('desmos')}>Desmos</Button>
            <Button data-testid='temp-geogebra' m={5} click={() => this.join('geogebra')}>GeoGebra</Button>
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
