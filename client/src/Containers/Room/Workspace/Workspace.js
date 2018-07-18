import React, { Component } from 'react';
import classes from './workspace.css';
class Workspace extends Component {
  // we need to track whether or not the ggbBase64 data was updated
  // by this user or by another client. Otherwise we were getting stuck
  // in an infinite loop because ggbApplet.setBase64 would be triggered
  // by socket.on('RECEIVE_EVENT') which then triggers undoListener which in
  // turn emits an event which will be received by the client who initiated
  // the event in the first place.
  state = {
    receivingData: false,
  }

  componentDidMount() {
    this.receivingData = false
    // In index.html create the ggbApp and attach it to the window. We need to do this
    // in index.html so the we have access to GGBApplet constructor
    window.ggbApp.inject('ggb-element')
    // ggbApp will attach the ggbApplet to the document object; poll the document
    // until that has happened
    const timer = setInterval(() => {
      this.ggbApplet = window.ggbApplet;
      if (this.ggbApplet) { // @TODO dont intialiZe if replaying
        // setup the even listeners
        // load the most recent workspace event if we're not replaying
        let events = this.props.room.events;
        if (!this.props.replaying && events.length > 0){
          this.ggbApplet.setXML(events[events.length - 1].event)
          this.props.loaded()
        }
        else {this.props.loaded()}
        this.initialize();
        clearInterval(timer);
      }
    }, 1000)

    // we dont need socket functionality on replay
    if (!this.props.replaying) {
      this.socket = this.props.socket;
      // define the socket listeners for handling events from the backend
      this.socket.on('RECEIVE_EVENT', event => {
        /// @TODO update room object in parents state so that the events.length stay up to date
        // this.receivingData = true;
        this.ggbApplet.setXML(event)
        this.props.updateRoom({events: event})
        console.log("Listeners: ", this.ggbApplet.listeners)
        console.log(this.ggbApplet)
        this.ggbApplet.registerAddListener(this.eventListener)
        console.log("Listeners: ", this.ggbApplet.listeners)
      })
    }
  }

  // @TODO IM thinking we should use shouldupdate instead??? thoughts??
  // or takesnapshot or whatever its called -- this seems BAD
  shouldComponentUpdate(nextProps, nextState) {
    // checking that this props and the incoming props are both replayin
    // ensures that this is not the first time we received
    if (nextProps.replaying && this.props.replaying) {
      this.ggbApplet.setXML(this.props.room.events[this.props.eventIndex].event)
      return true;
    }
    if (!nextProps.replaying && this.props.replaying) {
      const events = nextProps.room.events;
      this.ggbApplet.setXML(events[events.length - 1].event)
      return true;
    }
    else return false;
  }

  componentWillUnmount() {
    console.log('unregistering listeners')
    this.ggbApplet.unregisterAddListener(this.eventListener);
    this.ggbApplet.unregisterUpdateListener(this.eventListener);
    this.ggbApplet.unregisterRemoveListener(this.eventListener);
    // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    // this.ggbApplet.unregisterClearListener(this.clearListener);
  }

  // initialize the geoegbra event listeners /// THIS WAS LIFTED FROM VCS
  initialize = () => {
    console.log("INTIALIZED GGB LISTENERS")
    this.eventListener = obj => {
      console.log('is this being invoked')
      console.log(this.state.receivingData);
      console.log(obj)
      // if (!this.state.receivingData) {
        sendEvent(obj)
      // }
      // this.receivingData = false;
    }

    const sendEvent = obj => {
      //@TODO get information from obj.xml to save for more detailed playback
      const newData = {}
      newData.room = this.props.room._id;
      newData.event = this.ggbApplet.getXML();
      newData.user = this.props.userId;
      this.props.updateRoom({events: newData})
      this.socket.emit('SEND_EVENT', newData, () => {
        console.log('success');
      })
    }
    // attach this listeners to the ggbApplet
    if (this.ggbApplet.listeners.length === 0) {
      this.ggbApplet.registerAddListener(this.eventListener);
      this.ggbApplet.registerUpdateListener(this.eventListener);
      this.ggbApplet.registerRemoveListener(this.eventListener);
      this.ggbApplet.registerStoreUndoListener(this.eventListener);
      this.ggbApplet.registerClearListener(this.eventListener);
      console.log(this.ggbApplet)
    }
  }

  render() {
    return (
        <div className={classes.Workspace} id='ggb-element'></div>
    )
  }
}

export default Workspace;
