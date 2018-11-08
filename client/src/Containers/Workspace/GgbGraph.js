import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
// import throttle from 'lodash/throttle';
import { parseString } from 'xml2js';
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
        switch (data.eventType) {
          case 'ADD':
            if (data.definition) {
              this.ggbApplet.evalCommand(`${data.label}:${data.definition}`)
            }
            this.ggbApplet.evalXML(data.event)
            this.ggbApplet.evalCommand('UpdateConstruction()')
            break;
          case 'REMOVE':
            this.ggbApplet.deleteObject(data.label)
            break;
          case 'UPDATE':
            this.ggbApplet.evalXML(data.event)
            this.ggbApplet.evalCommand('UpdateConstruction()')
            break;
          default: break;
        }
      })
    })
  }

  onScriptLoad = () => {
    // NOTE: complete list here: https://wiki.geogebra.org/en/Reference:GeoGebra_App_Parameters
    const parameters = {
      "id":"ggbApplet",
      "width": window.innerWidth * .60, // 75% width of container
      "height": window.innerHeight - 300,
      "customToolBar": "0 39 73 62 | 1 501 67 , 5 19 , 72 75 76 | 2 15 45 , 18 65 , 7 37 | 4 3 8 9 , 13 44 , 58 , 47 | 16 51 64 , 70 | 10 34 53 11 , 24  20 22 , 21 23 | 55 56 57 , 12 | 36 46 , 38 49  50 , 71  14  68 | 30 29 54 32 31 33 | 25 17 26 60 52 61 | 40 41 42 , 27 28 35 , 6",
      "showToolBar": true,
      "showMenuBar": true,
      "showAlgebraInput":true,
      "language": "en",
      "useBrowserForJS":false,
      "preventFocus":true,
      // "appName":"whiteboard"
    };

    const ggbApp = new window.GGBApplet(parameters, '5.0');
    ggbApp.inject('ggb-element')
    // TRY REPLACING THIS WITH parameters.appletOnLoad(ggbApplet)
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
    if (this.ggbApplet && this.ggbApplet.listeners) {
      delete window.ggbApplet;
      this.ggbApplet.unregisterAddListener(this.addListener);
      this.ggbApplet.unregisterUpdateListener();
      this.ggbApplet.unregisterRemoveListener(this.eventListener);
      // this.ggbApplet.unregisterClearListener(this.clearListener);
      // this.ggbApplet.unregisterStoreUndoListener(this.undoListener);
    }
    if (!this.props.tempRoom) {
      let canvas = document.querySelector('[aria-label="Graphics View 1"]');
      this.props.updateRoom(this.props.room._id, {graphImage: {imageData: canvas.toDataURL()}})
    }
  }

  initializeGgb = () => {
    const { user, room } = this.props;
    const { events } = room;
    if (events.length > 0) {
      this.ggbApplet.setXML(room.currentState)
    }
    this.addListener = label => {
      if (!this.state.receivingData) {
        const xml = this.ggbApplet.getXML(label)
        const definition = this.ggbApplet.getCommandString(label);
        sendEvent(xml, definition, label, "ADD", "added");
      }
      this.setState({receivingData: false})
    }

    this.removeListener = label => {
      if (!this.state.receivingData) {
        sendEvent(null, null, label, "REMOVE", "removed")
      }
      this.setState({receivingData: false})
    }

    const sendEvent = async (xml, definition, label, eventType, action) => {
      let xmlObj;
      if (xml) xmlObj = await parseXML(xml)
      const newData = {
        definition,
        label,
        eventType,
        room: room._id,
        roomId: room._id,
        event: xml,
        description: `${user.username} ${action} ${xmlObj ? xmlObj.element.$.type : ''} ${label}`,
        user: {_id: user._id, username: user.username},
        timestamp: new Date().getTime(),
        currentState: this.ggbApplet.getXML(),
      }
      this.socket.emit('SEND_EVENT', newData)
    }
    // attach this listeners to the ggbApplet
    if (this.ggbApplet.listeners.length === 0) {
      this.ggbApplet.registerAddListener(this.addListener);
      this.ggbApplet.registerUpdateListener(this.updateListener);
      this.ggbApplet.registerRemoveListener(this.removeListener);
    }

    const parseXML = (xml) => {
      return new Promise((resolve, reject) => {
        parseString(xml, (err, result) => {
          if (err) return reject(err)
          return resolve(result)
        })
      })
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
