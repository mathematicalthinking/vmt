import React, { Component } from 'react';
import Script from 'react-load-script';
import { GRAPH_HEIGHT } from '../../constants';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
import API from '../../utils/apiRequests';
class DesmosReplayer extends Component {

  state = {
    loading: true,
    tabStates: {}
  }

  calculatorRef = React.createRef();

  componentDidMount() {
    console.log('desmos mounted')
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   if (this.props.index !== nextProps.index || this.state.loading !== nextState.loading) {
  //     return true;
  //   }
  //   else if (this.props.currentTab !== nextProps.currentTab) {
  //     return true;
  //   }
  //   return false;
  // }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.event._id !== this.props.event._id && !this.state.loading && !this.props.event.text) {
  //     this.calculator.setState(this.props.event.event)
  //   }
  // }

  onScriptLoad = () => {
    console.log('script loaded')
    this.calculator = window.Desmos.GraphingCalculator(this.calculatorRef.current);
    let { tab } = this.props;
    console.log('starting point ', tab.startingPoint)
    if (tab.startingPoint) {
      this.setState({
        tabStates: {
          ...this.state.tabStates,
          [tab._id]: {construction: tab.startingPoint}
        }
      }, () => this.setState({loading: false}))
    } else if (tab.desmosLink) {
      API.getDesmos(tab.desmosLink)
      .then(res => {
        this.calculator.setState(res.data.result.state)
        // console.
        this.setState({loading: false})
        this.initializeListeners()

      })
      .catch(err => console.log(err))
    } else {
      console.log('setting blank')
     this.calculator.setBlank()
     this.setState({loading: false})
    }
  }


  render() {
    return (
      <Aux>
        <Script url='https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6' onLoad={this.onScriptLoad} />
        <div style={{height: GRAPH_HEIGHT, width: "100%"}} id='calculator' ref={this.calculatorRef}></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default DesmosReplayer;
