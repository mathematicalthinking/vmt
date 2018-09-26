import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import { parseString, Builder } from 'xml2js';
const builder = new Builder();
class GgbGraph extends Component {

  state = {
    receivingData: false,
    loadingWorkspace: true,
    loading: true,
  }

  componentDidMount() {
    this.socket = this.props.socket;

    this.socket.on('RECEIVE_EVENT', data => {
      this.setState({receivingData: true}, () => {
        console.log('receiving data from other client')
        if (data.eventType === 'ADD') {
          console.log(`${data.label}:${data.definition}`)
          console.log(data.event)
          if (data.definition) {
            this.ggbApplet.evalCommand(`${data.label}:${data.definition}`)
          }
          this.ggbApplet.evalXML(data.event)
          this.ggbApplet.evalCommand('UpdateConstruction()')
        }
      })
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
    // TRY REPLACING THIS WITH parameters.appletOnLoad
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
      this.ggbApplet.unregisterUpdateListener();
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      // this.ggbApplet.unregisterClearListener(this.clearListener);
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    }
  }

  initializeGgb = () => {
    const { user, room } = this.props;
    const { events } = room;
    if (events.length > 0) {
      this.ggbApplet.setXML(events[events.length - 1].event)
    }
    this.addListener = label => {
      console.log('something added')
      if (this.state.receivingData) {
        console.log('...but not by us')
      }
      if (!this.state.receivingData) {
        const xml = this.ggbApplet.getXML(label)
        const definition = this.ggbApplet.getCommandString(label);
        const newData = {
          room: room._id,
          event: xml,
          definition,
          label,
          eventType: "ADD",
          description: `${user.username} created ${label}`,
          user: {_id: user.id, username: user.username},
          timestamp: new Date().getTime(),
        }
        console.log(newData)
        sendEvent(newData);
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
      this.ggbApplet.registerUpdateListener(() => {console.log('update listener fired: '); this.addListener()});
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
