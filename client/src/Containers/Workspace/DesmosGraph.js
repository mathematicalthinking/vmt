import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import API from '../../utils/apiRequests'
class DesmosGraph extends Component {

  state = {
    loading: window.Desmos ? false : true,
    sendingEvent: false,
  }

  calculatorRef = React.createRef();

  componentDidMount(){
    if (window.Desmos) {
      this.calculator = window.Desmos.GraphingCalculator(this.calculatorRef.current);
      this.setState({loading: false})  
    }
  }

  onScriptLoad =  () => {
    console.log('script loaded')
    console.log(window.Desmos)
    this.calculator = window.Desmos.GraphingCalculator(this.calculatorRef.current);
    let { room, currentTab }= this.props
    let { tabs } = room;
    let {desmosLink, events} = tabs[currentTab]
    if (tabs[currentTab].events && tabs[currentTab].events.length > 0) {
      this.calculator.setState(events[events.length - 1].event)
      this.setState({loading: false})
      this.initializeListeners()
    } else if (desmosLink) {
      // @TODO This will require some major reconfiguration / But what we shoould do is
      // when the user creates this room get teh state from the link and then just save it
      // as as event on this model.
      API.getDesmos(desmosLink)
      .then(res => {
        this.calculator.setState(res.data.result.state)
        // console.
        this.setState({loading: false})
        this.initializeListeners()

      })
      .catch(err => console.log(err))
    }
    else {
      this.initializeListeners()
      this.setState({loading: false})
    }
  }

  componentWillUnmount(){
    console.log("componentUNMOUNTING")
  }

  initializeListeners(){
    // INITIALIZE EVENT LISTENER
    this.calculator.observeEvent('change', () => {
      if (!this.state.receivingEvent) {
        const newData = {
          room: this.props.room._id,
          event: this.calculator.getState(),
          user: {_id: this.props.user._id, username: this.props.user.username},
          timestamp: new Date().getTime()
        }
        this.props.socket.emit('SEND_EVENT', newData, res => {
          
        })
      } else {
        // @TODO CONSIDER DOING THIS AS JUST A PROPERTY OF THIS CLASS AND NOT A PROPERTY
        // OF STATE ... WE DON"T REALLY NEED RE_RENDERS HERE
        this.setState({receivingEvent: false})
      }
      // this.socket.emit('SEND_EVENT', event)
    })
    this.props.socket.on('RECEIVE_EVENT', data => {
      this.setState({receivingEvent: true})
      this.calculator.setState(JSON.parse(data.event))
    })
  }

  render() {
    console.log(window.Desmos)
    return (
      <Aux>
        {!window.Desmos ? <Script url='https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6' onLoad={this.onScriptLoad} />: null}
        <div className={classes.Graph} id='calculator' ref={this.calculatorRef}></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default DesmosGraph;
