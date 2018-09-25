import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import { parseString, Builder } from 'xml2js';
const builder = new Builder();
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

    this.socket.on('RECEIVE_EVENT', data => {
      this.setState({receivingData: true})
      console.log('receiving event')
      // const xml = builder.buildObject(data.event)
      console.log(data.event)
      // console.log(xml)
      this.ggbApplet.evalXML(data.event)
      console.log(this.ggbApplet.getXML())
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
      delete window.ggbApplet;
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener(this.eventListener);
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      // this.ggbApplet.unregisterClearListener(this.clearListener);
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    }
  }
  //
  // // initialize the geoegbra event listeners /// THIS WAS LIFTED FROM VCS
  initializeGgb = () => {
    const { events } = this.props.room
    if (events.length > 0) {
      this.ggbApplet.setXML(events[events.length - 1].event)
    }
    this.addListener = obj => {
      console.log('object added')
      if (obj === null) {
        console.log("OBJECT === null");
        return;
      }
      if (!this.state.receivingData) {
        console.log('obj: ', obj)
        const xml = this.ggbApplet.getXML(obj)
        if (xml === '') {
          console.log('deleted: ', obj)
        }
        parseString(xml, (err, result) => {
          console.log(result)
          console.log(typeof result)
          console.log("RESULT FROM PARSE: ", result)
          const { type } = result.element.$
          const { x, y } = result.element.coords[0].$
          const event = `<expression label="${obj}" exp="(${x}, ${y})" type="${type}"/>${xml}`
          const newData = {
            room: this.props.room._id,
            event: event,
            user: {_id: this.props.user.id, username: this.props.user.username},
            timestamp: new Date().getTime(),
          }
          console.log(newData)
          if (newData.event === '') {
            console.log('deleted event')
          }// then the object was deleted

          // this.ggbApplet.setXML(newData.event)
          // this.props.updateRoom({events: newData})
          sendEvent(newData);
        })
      }
      this.setState({receivingData: false})
    }

    const sendEvent = newData => {
      //@TODO get information from obj.xml to save for more detailed playback
      console.log('emit event!')
      this.socket.emit('SEND_EVENT', newData)
    }
    // attach this listeners to the ggbApplet
    if (this.ggbApplet.listeners.length === 0) {
      this.ggbApplet.registerAddListener(this.addListener);
      this.ggbApplet.registerUpdateListener(this.eventListener);
      // this.ggbApplet.registerRemoveListener(this.eventListener);
      // this.ggbApplet.registerStoreUndoListener(this.eventListener);
      // this.ggbApplet.registerClearListener(this.eventListener);
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
