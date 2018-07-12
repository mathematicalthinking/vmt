import React, { Component } from 'react';
import classes from './workspace.css';
import glb from '../../../global.css';
import Aux from '../../../Components/HOC/Auxil';
import Loading from '../../../Components/UI/Loading/Loading';
let ggbApplet;
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
    console.log(this.props.events)
    // THIS IS EXTREMELEY HACKY -- basically what's going on here is that
    // we need to access the ggbApplet object that is attached to the iframe
    // window by the external geogebra cdn script. This takes a little bit of
    // time but there doesn't seem to be a way to listen for that change, so
    // instead we are essentially polling window object to see if it has
    // the ggbApplet property yet.
    const timer = setInterval(() => {
      const iframe = document.getElementById('ggbRoom').contentDocument;
      ggbApplet = iframe.ggbApplet;
      if (ggbApplet) { // @TODO dont intialiZe if replaying
        this.initialize();
        this.setState({loading: false})
        // @TODO insread of passing the file to the iframe we could instead just set
        // base64 right here and then setState of loading in it's call back,
        // because right now we're losing the loading screen after the geogebra
        // frame is loaded, but before the data is loaded
        clearInterval(timer);
      }
    }, 1000)

    // we dont need socket functionality on replay
    if (!this.props.replaying) {
      this.socket = this.props.socket;
      // define the socket listeners for handling events from the backend
      this.socket.on('RECEIVE_EVENT', event => {
        this.setState({
          receivingData: true
        })
        ggbApplet.setBase64(event)
      })
    }
  }
  // @TODO IM thinking we should use shouldupdate instead??? thought??
  componentWillReceiveProps(nextProps) {
    // checking that this props and the incoming props are both replayin
    // ensures that this is not the first time we received
    if (nextProps.replaying && this.props.replaying) {
      ggbApplet.setBase64(this.props.room.events[this.props.eventIndex].event)
    }
  }

  update = () => {
  }
  // initialize the geoegbra event listeners /// THIS WAS LIFTED FROM VCS
  initialize = () => {
    const updateListener = objName => {
    }

    const addListener = objName => {
        if (!this.state.receivingData) {
          const newData = {}
          newData.room = this.props.room._id;
          newData.event = ggbApplet.getBase64();
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
      // this seems to fire when an event is completed
        // if (!this.state.receivingData) {
        //   const newData = {}
        //   newData.room = this.props.room._id;
        //   newData.event = ggbApplet.getBase64();
        //   newData.user = this.props.userId;
        //   console.log('emiting event from client')
        //   this.socket.emit('SEND_EVENT', newData, () => {
        //     console.log('success');
        //   })
        // }
        // this.setState({
        //   receivingData: false
        // })
    }

    const removeListener = objName => {
    }

    const clearListener = () =>  {
    }
    // attach this listeners to the ggbApplet
    ggbApplet.registerUpdateListener(updateListener);
    ggbApplet.registerAddListener(addListener);
    ggbApplet.registerRemoveListener(removeListener);
    ggbApplet.registerStoreUndoListener(undoListener);
    ggbApplet.registerClearListener(clearListener);
  }

  render() {
    // send the most recent event history if live
    let file = '';
    const events = this.props.room.events;
    if (events.length > 0) file = events[events.length - 1].event;

    // send the first event if not
    // send and empty strting if theres no event history
    return (
      <Aux>
        <Loading show={this.state.loading} message="Loading the Geogebra workspace...this may take a moment"/>
        <div className={[classes.Container, glb.FlexRow].join(' ')}>
          <iframe
            className={classes.Iframe}
            title={this.props.roomName}
            id='ggbRoom'
            src={`/Geogebra.html?file=${file}`}
            ref={(element) => {this.ifr = element}}
          >
          </iframe>
        </div>
      </Aux>
    )
  }
}

export default Workspace;
