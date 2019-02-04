import React, { Component } from "react";
import classes from "./graph.css";
import Aux from "../../Components/HOC/Auxil";
import Modal from "../../Components/UI/Modal/Modal";
import Script from "react-load-script";
import API from "../../utils/apiRequests";
// import { updatedRoom } from '../../store/actions';
class DesmosActivityGraph extends Component {
  state = {
    loading: window.Desmos ? false : true
  };
  calculatorRef = React.createRef();

  componentDidMount() {
    console.log("MOUNTED");
    if (window.Desmos) {
      console.log("alreadt have desmos");
      let { activity, currentTab } = this.props;
      let { tabs } = activity;
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
      this.setState({ loading: false });
      if (tabs[currentTab].currentState) {
        this.calculator.setState(tabs[currentTab].currentState);
      } else if (tabs[currentTab].desmosLink) {
        API.getDesmos(tabs[currentTab].desmosLink)
          .then(res => {
            this.calculator.setState(res.data.result.state);
          })
          .catch(err => console.log(err));
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.currentTab !== this.props.currentTab) {
      if (this.props.role === "facilitator") {
        let updatedTabs = [...prevProps.activity.tabs];
        let updatedTab = updatedTabs[prevProps.currentTab];
        updatedTab.currentState = JSON.stringify({
          ...this.calculator.getState()
        });
        updatedTabs[this.props.currentTab] = updatedTab;
      }
      console.log("tab switched");
      this.calculator.setState(
        this.props.activity.tabs[this.props.currentTab].currentState
      );
    }
  }

  componentWillUnmount() {
    // save on unmount
    if (this.props.role === "facilitator") {
      let updatedTabs = [...this.props.activity.tabs];
      let updatedTab = updatedTabs[this.props.currentTab];
      updatedTab.currentState = JSON.stringify({
        ...this.calculator.getState()
      });
      updatedTabs[this.props.currentTab] = updatedTab;
    }
    this.calculator.unobserveEvent("change");
    this.calculator.destroy();
  }

  onScriptLoad = () => {
    this.calculator = window.Desmos.GraphingCalculator(
      this.calculatorRef.current
    );
    let { activity, currentTab } = this.props;
    let { tabs } = activity;
    let { desmosLink } = tabs[currentTab];
    if (tabs[currentTab].currentState) {
      this.calculator.setState(tabs[currentTab].currentState);
      this.setState({ loading: false });
    } else if (desmosLink) {
      API.getDesmos(desmosLink)
        .then(res => {
          this.calculator.setState(res.data.result.state);
          this.setState({ loading: false });
          // this.initializeListeners();
        })
        .catch(err => console.log(err));
    } else {
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <Aux>
        {!window.Desmos ? (
          <Script
            url="https://www.desmos.com/api/v1.2/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6"
            onLoad={this.onScriptLoad}
          />
        ) : null}
        <div
          className={classes.Graph}
          id="calculator"
          ref={this.calculatorRef}
        />
        <Modal show={this.state.loading} message="Loading..." />
      </Aux>
    );
  }
}

export default DesmosActivityGraph;
