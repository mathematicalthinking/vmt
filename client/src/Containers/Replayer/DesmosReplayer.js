import React, { Component } from "react";
import Script from "react-load-script";
import { GRAPH_HEIGHT } from "../../constants";
import Aux from "../../Components/HOC/Auxil";
import Modal from "../../Components/UI/Modal/Modal";
import API from "../../utils/apiRequests";
class DesmosReplayer extends Component {
  state = {
    loading: window.Desmos ? false : true,
    tabStates: {}
  };

  calculatorRef = React.createRef();

  componentDidMount() {
    if (window.Desmos) {
      let { inView, tab } = this.props;
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
      this.setState({ loading: false });
      if (inView && tab.desmosLink) {
        API.getDesmos(tab.desmosLink)
          .then(res => {
            this.calculator.setState(res.data.result.state);
            this.initializeListeners();
          })
          .catch(err => console.log(err));
      }
    }
  }

  // shouldComponentUpdate(nextProps) {
  //   if (this.props.inView && this.props.index !== nextProps.index) {
  //     return true;
  //   } else if (this.props.loading && !nextProps.loading) {
  //     return true;
  //   } else return false;
  // }

  componentWillUnmount() {
    if (this.calculator) {
      this.calculator.unobserveEvent("change");
      this.calculator.destroy();
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.inView) {
      if (
        prevProps.index !== this.props.index &&
        this.props.log[this.props.index].event
      ) {
        this.calculator.setState(this.props.log[this.props.index].event);
      }
    }
  }

  onScriptLoad = () => {
    this.calculator = window.Desmos.GraphingCalculator(
      this.calculatorRef.current
    );
    let { tab } = this.props;
    if (tab.startingPoint) {
      this.setState(
        {
          tabStates: {
            ...this.state.tabStates,
            [tab._id]: { construction: tab.startingPoint }
          }
        },
        () => this.setState({ loading: false })
      );
    } else if (tab.desmosLink) {
      API.getDesmos(tab.desmosLink)
        .then(res => {
          this.calculator.setState(res.data.result.state);
          // console.
          this.setState({ loading: false });
          this.initializeListeners();
        })
        .catch(err => console.log(err));
    } else {
      this.calculator.setBlank();
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <Aux>
        {!window.Desmos ? (
          <Script
            url="https://www.desmos.com/api/v1.1/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
            onLoad={this.onScriptLoad}
          />
        ) : null}
        <div
          style={{ height: "100%", width: "100%" }}
          id="calculator"
          ref={this.calculatorRef}
        />
        <Modal show={this.state.loading} message="Loading..." />
      </Aux>
    );
  }
}

export default DesmosReplayer;
