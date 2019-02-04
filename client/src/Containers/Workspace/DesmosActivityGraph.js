import React, { Component } from "react";
import classes from "./graph.css";
import Aux from "../../Components/HOC/Auxil";
import Modal from "../../Components/UI/Modal/Modal";
import Script from "react-load-script";
import socket from "../../utils/sockets";
import API from "../../utils/apiRequests";
// import { updatedRoom } from '../../store/actions';
class DesmosActivityGraph extends Component {
  state = {
    loading: window.Desmos ? false : true,
    receivingEvent: false
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
            // this.initializeListeners();
          })
          .catch(err => console.log(err));
      }
      this.initializeListeners();
    }
  }

  shouldComponentUpdate(nextProps) {
    if (nextProps.currentTab !== this.props.currentTab) {
      return true;
    } else return false;
  }

  componentWillUnmount() {
    this.calculator.unobserveEvent("change");
    this.calculator.destroy();
  }

  componentDidUpdate(prevProps) {
    console.log(prevProps, this.props);
    console.log("UPDATED");
    if (prevProps.currentTab !== this.props.currentTab) {
      console.log("setting state");
      this.setState({ receivingEvent: true }, () => {
        let { room, currentTab } = this.props;
        let { tabs } = room;
        if (tabs[currentTab].currentState) {
          this.calculator.setState(tabs[currentTab].currentState);
        } else if (tabs[currentTab].desmosLink) {
          API.getDesmos(tabs[currentTab].desmosLink)
            .then(res => {
              this.calculator.setState(res.data.result.state);
              this.initializeListeners();
            })
            .catch(err => console.log(err));
        }
      });
    }
  }

  onScriptLoad = () => {
    console.log("script loaded");
    if (!this.calculator) {
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
    }
    let { activity, currentTab } = this.props;
    let { tabs } = activity;
    let { desmosLink } = tabs[currentTab];
    if (tabs[currentTab].currentState) {
      this.calculator.setState(tabs[currentTab].currentState);
      this.setState({ loading: false });
      this.initializeListeners();
    } else if (desmosLink) {
      // @TODO This will require some major reconfiguration / But what we shoould do is
      // when the user creates this room get teh state from the link and then just save it
      // as as event on this model.
      API.getDesmos(desmosLink)
        .then(res => {
          this.calculator.setState(res.data.result.state);
          // console.
          this.setState({ loading: false });
          this.initializeListeners();
        })
        .catch(err => console.log(err));
    } else {
      this.initializeListeners();
      this.setState({ loading: false });
    }
  };

  // componentWillUnmount(){
  //   console.log("componentUNMOUNTING")
  // }

  initializeListeners = () => {
    console.log("listeners");
    // INITIALIZE EVENT LISTENER
    this.calculator.observeEvent("change", event => {
      console.log("EVENT: ", event);
      if (this.props.role === "facilitator") {
        console.log("updating calc state");
        let updatedTabs = [...this.props.activity.tabs];
        let updatedTab = updatedTabs[this.props.currentTab];
        updatedTab.currentState = this.calculator.getState();
        updatedTab.currentState = JSON.stringify({
          ...updatedTab.currentState
        });
        updatedTabs[this.props.currentTab] = updatedTab;
        this.props.updateActivityTab(this.props.activity._id, updatedTab._id, {
          currentState: updatedTab.currentState
        });
      }
    });
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
