import React, { Component } from 'react';
import { connect } from 'react-redux';
import { populateRoom } from '../store/actions'
import io from 'socket.io-client';
import WorkspaceLayout from '../Layout/Room/Workspace/Workspace';
import TextInput from '../Components/Form/TextInput/TextInput';
import GgbGraph from './Workspace/GgbGraph';
import DesmosGraph from './Workspace/DesmosGraph';
import Modal from '../Components/UI/Modal/Modal';
import Button from '../Components/UI/Button/Button';
import Chat from './Workspace/Chat';
// import Replayer from ''
class TempWorkspace extends Component {

  state = {
    user: undefined,
    room: undefined,
    tempUsername: '',
    errorMessage: '',
    unloading: false,
    firstEntry: true,
    graph: null,
  }

  componentDidMount(){
    window.addEventListener("beforeunload", this.confirmUnload)
    console.log('fetching')
    if (this.props.room.roomType) this.setState({firstEntry: false})
    this.props.populateRoom(this.props.match.params.id)
  }

  componentDidUpdate(prevProps){
    if (prevProps.room.roomType !== this.props.room.roomType) {
      this.setState({firstEntry: false})
    }
  }

  setName = (event) => {
    this.setState({tempUsername: event.target.value, errorMessage: ''});
  }

  join = (graphType) => {
    console.log(graphType)
    if (this.state.tempUsername.length === 0) {
      return this.setState({errorMessage: "Please enter a username before joining"})
    }
    const { id } = this.props.match.params
    if (this.tempUsername === '') return; //@TODO Tell user to enter a name
    let sendData = {
      username: this.state.tempUsername,
      tempRoom: true,
      roomName: `temporary room ${id.slice(0, 5)}...`,
      roomId: id,
    }
    if (graphType) {
      sendData.roomType = graphType;
      this.setState({graph: graphType})
    }

    this.socket = io.connect(process.env.REACT_APP_SERVER_URL);
    this.socket.emit('JOIN', sendData, (res, err) => {
      if (err) {
        console.log(err) // HOW SHOULD WE HANDLE THIS
      }
      let room = res.room
      room.chat.push(res.message)
      this.setState({user: res.user, room: res.room})
    })

    this.socket.on('USER_JOINED', data => {
      this.updateMembers(data.currentUsers)
    })

    this.socket.on('USER_LEFT', data => {
      this.updateMembers(data.currentUsers)
    })
  }

  updateMembers = (newMembers) => {
    console.log('updating members')
    const updatedRoom = {...this.state.room};
    updatedRoom.currentUsers = newMembers;
    this.setState({room: updatedRoom})
  }

  componentWillUnmount () {
    this.socket.emit('disconnect')
    // window.removeEventListener("beforeunload", this.confirmUnload)
    window.removeEventListener("beforeunload", this.confirmUnload)
  }

  confirmUnload = (ev) => {
    this.setState({})
    ev.preventDefault();
    return ev.returnValue = 'Are you sure you want to leave';
  }

  render() {
    console.log(this.props.room)
    return (
      this.state.user ?
      <WorkspaceLayout
        members = {this.state.room.currentUsers || []}
        graph = {this.state.graph === 'geogebra' ? 
          () => <GgbGraph room={this.state.room} socket={this.socket} user={this.state.user}/> :
          () => <DesmosGraph room={this.state.room} socket={this.socket} user={this.state.user}/>
        }
        chat = {() => <Chat roomId={this.state.room._id} messages={this.state.room.chat || []} socket={this.socket} user={this.state.user} />}
      /> :
      <Modal show={!this.state.user}>
        Enter a temporary username
        <TextInput change={this.setName} />
        <div>{this.state.errorMessage}</div>
        { this.state.firstEntry ?
          <div>
            <Button m={5} click={() => this.join('desmos')}>Desmos</Button>
            <Button m={5} click={() => this.join('geogebra')}>GeoGebra</Button>
          </div> :
          <Button m={5} click={() => this.join()}>Join</Button>
        }
      </Modal>
    )
  }
}

const mapStateToProps = (store, ownProps) => ({
  room: store.rooms.byId[ownProps.match.params.id]
})

export default connect(mapStateToProps, { populateRoom })(TempWorkspace)
