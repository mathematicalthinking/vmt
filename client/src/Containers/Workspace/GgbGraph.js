import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
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
        console.log('receiving data from other client')
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

    this.updateListener = label => {
      if (!this.state.receivingData) {
        const xml = this.ggbApplet.getXML(label)
        sendEvent(xml, null, label, "UPDATE", "updated")
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
        event: xml,
        description: `${user.username} ${action} ${xmlObj ? xmlObj.element.$.type : ''} ${label}`,
        user: {_id: user.id, username: user.username},
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
