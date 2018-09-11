import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../../Components/HOC/Auxil';
import Modal from '../../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import API from '../../../utils/apiRequests'
class DesmosGraph extends Component {

  state = {
    loading: true,
    sendingEvent: false,
  }

  onScriptLoad =  () => {
    console.log('script loaded')
    const elt = document.getElementById('calculator');
    this.calculator = window.Desmos.GraphingCalculator(elt);
    const tabs = this.props.room.tabs;
    console.log(tabs)
    if (tabs.length > 0) {
      console.log('there are tabs')
      if (tabs[0].events.length > 0) {
        this.calculator.setState(tabs[0].events[0].event)
      }
      if (tabs[0].desmosLink) {
        console.log('we have a desmos link')
        // @TODO This will require some major reconfiguration / But what we shoould do is
        // when the user creates this room get teh state from the link and then just save it
        // as as event on this model.
        API.getDesmos(tabs[0].desmosLink)
        .then(res => {
          this.calculator.setState(res.data.result.state)
          console.log("CALCULATOR: ", this.calculator)
          // console.
          this.setState({loading: false})
          this.initializeListeners()

        })
        .catch(err => console.log(err))
      }
    }
    else {
      console.log('no tabs')
      this.initializeListeners()
      this.setState({loading: false})
    }

  }

  initializeListeners = () => {
    // INITIALIZE EVENT LISTENER
    this.calculator.observeEvent('change', () => {
      const data = {
        user: this.props.userId,
        room: this.props.room._id,
        event: this.calculator.getState(),
      }
      console.log(data)
      if (!this.state.receivingEvent) {
        this.props.socket.emit('SEND_EVENT', data, res => {
          console.log(res)
        })
      } else {
        // @TODO CONSIDER DOING THIS AS JUST A PROPERTY OF THIS CLASS AND NOT A PROPERTY
        // OF STATE ... WE DON"T REALLY NEED RE_RENDERS HERE
        this.setState({receivingEvent: false})
      }
      // this.socket.emit('SEND_EVENT', event)
    })
    this.props.socket.on('RECEIVE_EVENT', event => {
      this.setState({receivingEvent: true})
      console.log(event)
      this.calculator.setState(event)
    })
  }


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
