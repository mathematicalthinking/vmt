import React, { Component } from 'react';
import classes from './workspace.css';
import glb from '../../../global.css';
import Aux from '../../../Components/HOC/Auxil';
import Loading from '../../../Components/UI/Loading/Loading';
// let ggbApplet;
// let GGBApplet;
class Workspace extends Component {
  // we need to track whether or not the ggbBase64 data was updated
  // by this user or by another client. Otherwise we were getting stuck
  // in an infinite loop because ggbApplet.setBase64 would be triggered
  // by socket.on('RECEIVE_EVENT') which then triggers undoListener which in
  // turn emits an event which will be received by the client who initiated
  // the event in the first place.
  state = {
    receivingData: false,
    events: [],
    loading: true,
  }

  componentDidMount() {
    // In index.html create the ggbApp and attach it to the window. We need to do this
    // in index.html so the we have access to GGBApplet constructor
    window.ggbApp.inject('ggb-element')
    // ggbApp will attach the ggbApplet to the document object; poll the document
    // until that has happened
    const timer = setInterval(() => {
      this.ggbApplet = document.ggbApplet;
      if (this.ggbApplet) { // @TODO dont intialiZe if replaying
        // setup the even listeners
        this.initialize();
        // load the most recent workspace event if we're not replaying
        if (!this.props.replaying && this.props.room.events){
          this.ggbApplet.setBase64(this.props.room.events[this.props.room.events.length - 1].event, () => {
            this.setState({loading: false})
          })
        }
        clearInterval(timer);
      }
    }, 1000)

    // we dont need socket functionality on replay
    if (!this.props.replaying) {
      this.socket = this.props.socket;
      // define the socket listeners for handling events from the backend
      this.socket.on('RECEIVE_EVENT', event => {
        console.log('receiving event')
        this.setState({
          receivingData: true
        })
        this.ggbApplet.setBase64(event)
      })
    }
  }
  // @TODO IM thinking we should use shouldupdate instead??? thoughts??
  // or takesnapshot or whatever its called
  componentWillReceiveProps(nextProps) {
    // checking that this props and the incoming props are both replayin
    // ensures that this is not the first time we received
    if (nextProps.replaying && this.props.replaying) {
      this.ggbApplet.setBase64(this.props.room.events[this.props.eventIndex].event)
    }
  }

  // initialize the geoegbra event listeners /// THIS WAS LIFTED FROM VCS
  initialize = () => {
    // if in live mode set the base64 to the most recent event
    console.log('initialized!')
    const updateListener = objName => {
      console.log('update listener')
    }

    const addListener = objName => {
      console.log('add listener')
      console.log(this.state.receivingData)
      if (!this.state.receivingData) {
        const newData = {}
        newData.room = this.props.room._id;
        newData.event = this.ggbApplet.getBase64();
        newData.user = this.props.userId;
        console.log('emiting event from client')
        this.socket.emit('SEND_EVENT', newData, () => {
          console.log('success');
        })
      }
      this.setState({
        receivingData: false
      })
    }

    const undoListener = () => {
      console.log('undo listener')
      // this seems to fire when an event is completed
        if (!this.state.receivingData) {
          const newData = {}
          newData.room = this.props.room._id;
          newData.event = this.ggbApplet.getBase64();
          newData.user = this.props.userId;
          console.log('emiting event from client')
          this.socket.emit('SEND_EVENT', newData, () => {
            console.log('success');
          })
        }
        this.setState({
          receivingData: false
        })
    }

    const removeListener = objName => {
    }

    const clearListener = () =>  {
    }
    // attach this listeners to the ggbApplet
    this.ggbApplet.registerUpdateListener(updateListener);
    this.ggbApplet.registerAddListener(addListener);
    this.ggbApplet.registerRemoveListener(removeListener);
    this.ggbApplet.registerStoreUndoListener(undoListener);
    this.ggbApplet.registerClearListener(clearListener);
  }

  render() {
    return (
      <Aux>
        <Loading show={this.state.loading} message="Loading the Geogebra workspace...this may take a moment"/>
        <div className={classes.Workspace} id='ggb-element'></div>
      </Aux>
    )
  }
}

export default Workspace;
