import React, { Component } from 'react';
import Script from 'react-load-script';
import Aux from '../../Components/HOC/Auxil';
import Modal from '../../Components/UI/Modal/Modal';
class DesmosReplayer extends Component {

  state = {
    loading: true,
  }

  calculatorRef = React.createRef();

  onScriptLoad = () => {
    this.calculator = window.Desmos.GraphingCalculator(this.calculatorRef.current);
    this.setState({loading: false});
  }

  componendDidUpdate(prevProps) {
    if (prevProps.event !== this.props.event && !this.state.loading) {
      this.calculator.setState(this.props.event)
    }
  }

  render() {
    return (
      <Aux>
        <Script url='https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6' onLoad={this.onScriptLoad} />
        <div style={{height: window.innerHeight - 300}} id='calculator' ref={this.calculatorRef}></div>
        <Modal show={this.state.loading} message='Loading...'/>
      </Aux>
    )
  }
}

export default DesmosReplayer;
