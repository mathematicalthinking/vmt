import React, { Component } from 'react';
import classes from './graph.css';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import Script from 'react-load-script';
import socket from '../../utils/sockets';
import API from '../../utils/apiRequests'
// import { updatedRoom } from '../../store/actions';
class DesmosGraph extends Component {

  state = {
    loading: window.Desmos ? false : true,
    receivingEvent: false,
  }

  calculatorRef = React.createRef();

  componentDidMount() {
    if (window.Desmos) {
      let { room, currentTab } = this.props;
      let { tabs } = room;
      this.calculator = window.Desmos.GraphingCalculator(this.calculatorRef.current);
      this.setState({loading: false})
      if (tabs[currentTab].currentState) {
        this.calculator.setState(tabs[currentTab].currentState)
        this.initializeListeners()
      } else if (tabs[currentTab].desmosLink) {
        API.getDesmos(tabs[currentTab].desmosLink)
        .then(res => {
          this.calculator.setState(res.data.result.state)
          this.initializeListeners()

        })
        .catch(err => console.log(err))
      }
    }
  }

  componentWillUnmount() {
    this.calculator.unobserveEvent('change');
    this.calculator.destroy()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentTab !== this.props.currentTab) {
      this.setState({receivingEvent: true}, () => {
        let { room, currentTab } = this.props;
        let { tabs } = room;
        if (tabs[currentTab].currentState) {
          this.calculator.setState(tabs[currentTab].currentState)
        } else if (tabs[currentTab].desmosLink) {
          API.getDesmos(tabs[currentTab].desmosLink)
          .then(res => {
            this.calculator.setState(res.data.result.state)
            this.initializeListeners()

          })
          .catch(err => console.log(err))
        }
      })
    }
  }

  onScriptLoad =  () => {
    if (!this.calculator) {
      this.calculator = window.Desmos.GraphingCalculator(this.calculatorRef.current);
    }
    let { room, currentTab } = this.props
    let { tabs } = room;
    let {desmosLink, events} = tabs[currentTab]
    if (tabs[currentTab].currentState) {
      this.calculator.setState(tabs[currentTab].currentState)
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

  // componentWillUnmount(){
  //   console.log("componentUNMOUNTING")
  // }

  initializeListeners(){
    // INITIALIZE EVENT LISTENER
    this.calculator.observeEvent('change', () => {
      if (!this.state.receivingEvent) {
        if (!this.props.user.connected || this.props.room.controlledBy !== this.props.user._id) {
          this.calculator.undo();
          return alert("You are not in control. The update you just made will not be saved. Please refresh the page")
        }
        const newData = {
          room: this.props.room._id,
          tab: this.props.room.tabs[this.props.currentTab]._id,
          event: JSON.stringify(this.calculator.getState()),
          currentState: JSON.stringify(this.calculator.getState()),
          user: {_id: this.props.user._id, username: this.props.user.username},
          timestamp: new Date().getTime()
        }
        let updatedTabs = [...this.props.room.tabs];
        updatedTabs[this.props.currentTab].currentState = newData.currentState;
        this.props.updatedRoom(this.props.room._id, {tabs: updatedTabs})
        socket.emit('SEND_EVENT', newData, res => {
          this.props.resetControlTimer()
        })
      }
      this.setState({receivingEvent: false})
    })
    socket.removeAllListeners('RECEIVE_EVENT')
    socket.on('RECEIVE_EVENT', data => {
      let updatedTabs = this.props.room.tabs.map(tab => {
        if (tab._id === data.tab) {
          tab.currentState = data.currentState
        }
        return tab;
      })
      this.props.updatedRoom(this.props.room._id, {tabs: updatedTabs})
      this.props.updatedRoom(this.props.room._id, {tabs: updatedTabs})

      if (this.props.room.tabs[this.props.currentTab]._id === data.tab) {
        this.setState({receivingEvent: true}, () => {
          this.calculator.setState(data.currentState)
        })
      } else {
        this.props.addNtfToTabs(data.tab)
      }
    })
  }

  render() {
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
