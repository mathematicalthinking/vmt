import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import API from '../../../utils/apiRequests';
class Workspace extends Component {
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
    console.log(this.props)
    this.socket = this.props.socket;
    // this.socket = io.connect(process.env.REACT_APP_SERVER_URL)
    // this.joinRoom()
  }

  handleGgbLoad = () => {
    const parameters = {
      "id":"ggbApplet",
      "width": 990,
      "height": 600,
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
    console.log(window.ggbAppler)
    const timer = setInterval(() => {
      if (window.ggbApplet) {
        console.log('we have the applet ')
        if (window.ggbApplet.listeners) {
          console.log('we have the listeners')
          console.log(window.ggbApplet.listeners)
          this.ggbApplet = window.ggbApplet;
          this.initializeGgb();
          this.setState({loading: false})
          clearInterval(timer);

        }
      }
    })
        // setup the even listeners
        // load the most recent workspace event if we're not replaying
    // let events = this.props.room.events;
    // if (!this.props.replay && events.length > 0){
    //   this.ggbApplet.setXML(events[events.length - 1].event)
    //   this.setState({loading: false})
    // }
    // else {this.setState({loading: false})}

  }

  handleDesmosLoad = () => {
    console.log('desmos')
    const elt = document.getElementById('calculator');
    this.desmos = window.Desmos.GraphingCalculator(elt);
    const tabs = this.props.room.tabs;
    if (tabs.length > 0) {
      if (tabs[0].desmosLink) {
        API.getDesmos()
        .then(res => {
          console.log(res.data.result)
          const elt = document.getElementById('desmos');
          console.log(elt)
          console.log(window)
          const calculator = window.Desmos.GraphingCalculator(elt);
          console.log(calculator)
          calculator.setState(res.data.result.state)
          console.log(calculator.getState())
          this.setState({loading: false})

        })
        .catch(err => console.log(err))
      }
    }
  }
  //
  //   // we dont need socket functionality on replay
  //   if (!this.props.replaying) {
  //     this.socket = this.props.socket;
  //     // define the socket listeners for handling events from the backend
  //     this.socket.on('RECEIVE_EVENT', event => {
  //       /// @TODO update room object in parents state so that the events.length stay up to date
  //       // this.receivingData = true;
  //       this.ggbApplet.setXML(event)
  //       this.props.updateRoom({events: {event,}})
  //       // @TODO ^^^^^ this seems strange events: {event,} but we need
  //       // this to match the structure of the database so when we replay these received
  //       // events or events from the db they have the same structure...what we probably
  //       // want to do actually is rename the event property of event to xml or something
  //       this.ggbApplet.registerAddListener(this.eventListener)
  //     })
  //   }
  // }
  //
  // @TODO IM thinking we should use shouldupdate instead??? thoughts??
  // or takesnapshot or whatever its called -- this seems BAD
  // shouldComponentUpdate(nextProps, nextState) {
  //   // checking that this props and the incoming props are both replayin
  //   // ensures that this is not the first time we received
  //   if (nextProps.replaying && this.props.replaying) {
  //     this.ggbApplet.setXML(this.props.room.events[this.props.eventIndex].event)
  //     return true;
  //   }
  //   if (!nextProps.replaying && this.props.replaying) {
  //     const events = nextProps.room.events;
  //     this.ggbApplet.setXML(events[events.length - 1].event)
  //     return true;
  //   }
  //   if (!nextProps.room.events !== this.props.room.events) {
  //     return true;
  //   }
  //   else return false;
  // }
  //
  componentWillUnmount() {
    if (this.props.room.roomType === 'geogebra') {
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
    this.eventListener = obj => {
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
    console.log(this.ggbApplet)
    // if (this.ggbApplet.Listeners.length === 0) {
    //   this.ggbApplet.registerAddListener(this.eventListener);
    //   this.ggbApplet.registerUpdateListener(this.eventListener);
    //   this.ggbApplet.registerRemoveListener(this.eventListener);
    //   this.ggbApplet.registerStoreUndoListener(this.eventListener);
    //   this.ggbApplet.registerClearListener(this.eventListener);
    // }
  }

  render() {
    const roomType = this.props.room.roomType;
    let url; let id; let onLoad;
    if (roomType === 'geogebra') {
      url = 'https://cdn.geogebra.org/apps/deployggb.js'
      id = 'ggb-element'
      onLoad = this.handleGgbLoad;
    } else {
      url = 'https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
      id = 'desmos';
      onLoad = this.handleDesmosLoad;
    }
    return (
      <Aux>
        <Script url={url} onLoad={onLoad} />
        <div className={classes.Graph} id={id}></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default Workspace;
