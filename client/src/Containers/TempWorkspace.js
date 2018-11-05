import React, { Component } from 'react';
import { connect } from 'react-redux';
import { populateRoom } from '../store/actions'
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
    user: undefined,
    room: undefined,
    tempUsername: '',
    errorMessage: '',
    unloading: false,
    firstEntry: true,
    enteredRoom: false,
    saving: false,
    saved: false,
    graph: null, //desmos or geogebra
  }

  componentDidMount(){
    window.addEventListener("beforeunload", this.confirmUnload)
    if (this.props.room.roomType) this.setState({firstEntry: false}) 
    else this.props.populateRoom(this.props.match.params.id)
    
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
    this.setState({enteredRoom: true})

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
    if (this.state.saved) return
    ev.preventDefault();
    return ev.returnValue = 'Are you sure you want to leave';
  }

  saveWorkSpace = () => {
    console.log('saving worksepace')
    window.removeEventListener("beforeunload", this.confirmUnload)
    this.setState({saving: true})
  }

  render() {
    return (this.state.user ?
      <Aux>
        <Modal 
          show={this.state.saving} 
          closeModal={() => this.setState({saving: false})}
        >
          <Signup temp user={this.state.user} room={this.props.room._id} closeModal={() => this.setState({saving: false})}/>
        </Modal>
        <WorkspaceLayout
          temp
          loggedIn={false}
          save={this.saveWorkSpace}
          members = {this.state.room.currentUsers || []}
          graph = {this.state.graph === 'geogebra' ? 
            () => <GgbGraph room={this.state.room} socket={this.socket} user={this.state.user}/> :
            () => <DesmosGraph room={this.state.room} socket={this.socket} user={this.state.user}/>
          }
          chat = {() => <Chat roomId={this.state.room._id} messages={this.state.room.chat || []} socket={this.socket} user={this.state.user} />}
        />
      </Aux> :
      <Modal show={!this.state.user}>
        Enter a temporary username
        <TextInput light change={this.setName} />
        <div>{this.state.errorMessage}</div>
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
  loggedIn: store.user.loggedIn
})

export default connect(mapStateToProps, { populateRoom })(TempWorkspace)
