import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import API from '../../../utils/apiRequests'
class DesmosGraph extends Component {

  state = {
    loading: true,
  }

  componentDidMount() {

  }

  onScriptLoad = () => {
    const elt = document.getElementById('calculator');
    this.calculator = window.Desmos.GraphingCalculator(elt);
    const tabs = this.props.room.tabs;
    if (tabs.length > 0) {
      if (tabs[0].desmosLink) {
        API.getDesmos(tabs[0].desmosLink)
        .then(res => {
          this.calculator.setState(res.data.result.state)
          console.log("CALCULATOR: ", this.calculator)
          this.setState({loading: false})

        })
        .catch(err => console.log(err))
      }
      else {
        this.setState({loading: false})
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
  render() {
    return (
      <Aux>
        <Script url='https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6' onLoad={this.onScriptLoad} />
        <div className={classes.Graph} id='calculator'></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default DesmosGraph;
