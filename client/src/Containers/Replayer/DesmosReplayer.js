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

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.index !== nextProps.index || this.state.loading !== nextState.loading) {
      return true;
    }
    else if (this.props.currentTab !== nextProps.currentTab) {
      return true;
    }
    return false;
  }

  // componentDidUpdate(prevProps) {
  //   if (prevProps.event._id !== this.props.event._id && !this.state.loading && !this.props.event.text) {
  //     this.calculator.setState(this.props.event.event)
  //   }
  // }

  onScriptLoad = () => {
    this.calculator = window.Desmos.GraphingCalculator(this.calculatorRef.current);
    this.props.tabs.forEach(tab => {
      if (tab.tabType === 'desmos') {
        if (tab.startingPoint) {
          this.setState({
            tabStates: {
              ...this.state.tabStates,
              [tab._id]: {construction: tab.startingPoint}
            }
          })
        } else if (tab.desmosLink) {
          API.getDesmos(tab.desmosLink)
          .then(res => {
            this.calculator.setState(res.data.result.state)
            // console.
            this.setState({loading: false})
            this.initializeListeners()

          })
          .catch(err => console.log(err))
        }
      }
    })
    this.setState({loading: false});
  }


  render() {
    return (
      <Aux>
        <Script url='https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6' onLoad={this.onScriptLoad} />
        <div style={{height: GRAPH_HEIGHT}} id='calculator' ref={this.calculatorRef}></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default DesmosReplayer;
