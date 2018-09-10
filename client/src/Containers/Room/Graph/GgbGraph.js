import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
class GgbGraph extends Component {
  // we need to track whether or not the ggbBase64 data was updated
  // by this user or by another client. Otherwise we were getting stuck
  // in an infinite loop because ggbApplet.setBase64 would be triggered
  // by socket.on('RECEIVE_EVENT') which then triggers undoListener which in
  // turn emits an event which will be received by the client who initiated
  // the event in the first place. --- actually it seems like with the new
  // method of setXML this infinite loop is avoided and then we can get rid of state
  state = {
    receivingData: false,
    loadingWorkspace: true,
    loading: true,
  }
  //
  componentDidMount() {
    this.socket = this.props.socket;
    console.log(this.socket)

    this.socket.on('RECEIVE_EVENT', data => {
      console.log('dataL ', data)
      this.ggbApplet.evalXML(data)
      this.ggbApplet.registerAddListener(this.eventListener) // @HACK we're readding the event listener every time because setXML destorys them.
    })
  }

  onScriptLoad = () => {
    const parameters = {
      "id":"ggbApplet",
      "width": 1300 * .75, // 75% width of container
      "height": window.innerHeight - 300,
      "scaleContainerClass": 'applet_container',
      "showToolBar": true,
      "showMenuBar": true,
      "showAlgebraInput":true,
      "language": "en",
      "useBrowserForJS":false,
      "preventFocus":true,
      "appName":"whiteboard"
    };
    const ggbApp = new window.GGBApplet(parameters, true);
    ggbApp.inject('ggb-element')
    const timer = setInterval(() => {
      if (window.ggbApplet) {
        if (window.ggbApplet.listeners) {
          this.ggbApplet = window.ggbApplet;
          this.initializeGgb();
          this.setState({loading: false})
          clearInterval(timer);

        }
      }
    }, 1000)
  }

  componentWillUnmount() {
    if (this.ggbApplet.listeners) {
      this.ggbApplet.unregisterAddListener(this.eventListener);
      this.ggbApplet.unregisterUpdateListener(this.eventListener);
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      // this.ggbApplet.unregisterClearListener(this.clearListener);
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    }
  }
  //
  // // initialize the geoegbra event listeners /// THIS WAS LIFTED FROM VCS
  initializeGgb = () => {
    console.log(this.props.room)
    const { events } = this.props.room.tabs[0]
    if (events.length > 1) {
      this.ggbApplet.setXML(events[events.length - 1])
    }
    this.eventListener = obj => {
      // if (!this.state.receivingData) {
        sendEvent(obj)
      // }
      // this.receivingData = false;
    }

    const sendEvent = obj => {
      console.log(this.props)
      //@TODO get information from obj.xml to save for more detailed playback
      const newData = {}
      console.log(obj)
      newData.room = this.props.room._id;
      newData.event = this.ggbApplet.getXML(obj);
      console.log(newData.event)
      newData.user = this.props.userId;
      console.log(newData)
      // this.props.updateRoom({events: newData})
      this.socket.emit('SEND_EVENT', newData)
    }
    // attach this listeners to the ggbApplet
    if (this.ggbApplet.listeners.length === 0) {
      this.ggbApplet.registerAddListener(this.eventListener);
      this.ggbApplet.registerUpdateListener(this.eventListener);
      this.ggbApplet.registerRemoveListener(this.eventListener);
      this.ggbApplet.registerStoreUndoListener(this.eventListener);
      this.ggbApplet.registerClearListener(this.eventListener);
    }
  }

  render() {
    return (
      <Aux>
        <Script url='https://cdn.geogebra.org/apps/deployggb.js' onLoad={this.onScriptLoad} />
        <div className={classes.Graph} id='ggb-element'></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default GgbGraph;
