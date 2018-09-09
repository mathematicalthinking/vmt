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

  componentDidMount() {
    // Initialize socket listener
  }

  onScriptLoad =  () => {
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
          this.initializeListeners()

        })
        .catch(err => console.log(err))
      }
    }
    else {
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
