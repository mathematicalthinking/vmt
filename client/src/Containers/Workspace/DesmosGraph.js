import React, { Component } from "react";
import classes from "./graph.css";
import Aux from "../../Components/HOC/Auxil";
import Modal from "../../Components/UI/Modal/Modal";
import Script from "react-load-script";
import socket from "../../utils/sockets";
import API from "../../utils/apiRequests";
// import { updatedRoom } from '../../store/actions';
class DesmosGraph extends Component {
  state = {
    receivingEvent: false
  };
  expressionList = [];
  graph = {};

  calculatorRef = React.createRef();

  componentDidMount() {
    if (window.Desmos) {
      let { room, tabId } = this.props;
      let { tabs } = room;
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
      this.initializeListeners();
      this.setState({ loading: false });
      if (tabs[tabId].currentState) {
        this.calculator.setState(tabs[tabId].currentState);
      } else if (tabs[tabId].desmosLink) {
        API.getDesmos(tabs[tabId].desmosLink)
          .then(res => {
            this.calculator.setState(res.data.result.state);
            this.initializeListeners();
          })
          .catch(err => console.log(err));
      }
      this.props.setFirstTabLoaded();
    }
  }

  componentWillUnmount() {
    delete window.Demsmos;
    if (this.caluclator) {
      this.calculator.unobserveEvent("change");
      this.calculator.destroy();
    }
  }

  componentDidUpdate(prevProps) {
    // if (prevProps.currentTab !== this.props.currentTab) {
    //   this.setState({ receivingEvent: true }, () => {
    //     let { room, currentTab } = this.props;
    //     let { tabs } = room;
    //     if (tabs[currentTab].currentState) {
    //       this.calculator.setState(tabs[currentTab].currentState);
    //     } else if (tabs[currentTab].desmosLink) {
    //       API.getDesmos(tabs[currentTab].desmosLink)
    //         .then(res => {
    //           this.calculator.setState(res.data.result.state);
    //           this.initializeListeners();
    //         })
    //         .catch(err => console.log(err));
    //     }
    //   });
    // }
  }

  onScriptLoad = () => {
    this.initializing = true;
    if (!this.calculator) {
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
    }
    let { room, tabId } = this.props;
    let { tabs } = room;
    let { desmosLink, currentState } = tabs[tabId];
    if (currentState) {
      this.calculator.setState(currentState);
      this.initializeListeners();
    } else if (desmosLink) {
      // @TODO This will require some major reconfiguration / But what we shoould do is
      // when the user creates this room get teh state from the link and then just save it
      // as as event on this model.
      API.getDesmos(desmosLink)
        .then(res => {
          this.calculator.setState(res.data.result.state);
          // console.
          this.initializeListeners();
        })
        .catch(err => console.log(err));
    } else {
      let desmosState = this.calculator.getState();
      this.expressionList = desmosState.expressions.list;
      this.graph = desmosState.graph;
      this.initializeListeners();
    }
    this.props.setFirstTabLoaded();
    this.initializing = false;
  };

  initializeListeners() {
    // INITIALIZE EVENT LISTENER
    this.calculator.observeEvent("change", event => {
      // console.log("initializing ", this.initializing);
      if (this.initializing) return;
      let { room, tabId, user } = this.props;
      if (!this.state.receivingEvent) {
        let currentState = this.calculator.getState();
        let statesAreEqual = this.areDesmosStatesEqual(currentState);
        console.log("states are equal", statesAreEqual);
        // we only want to listen for changes to the expressions. i.e. we want to ignore zoom-in-out changes
        if (!user.connected || room.controlledBy !== user._id) {
          // this.calculator.undo();
          // return alert(
          //   "You are not in control. The update you just made will not be saved. Please refresh the page"
          // );
        }
        let currentStateString = JSON.stringify(currentState);
        // console.log(this.calculator.getState());
        const newData = {
          room: room._id,
          tab: room.tabs[tabId]._id,
          event: currentStateString,
          user: {
            _id: user._id,
            username: user.username
          },
          timestamp: new Date().getTime()
        };
        let id = room.tabs[tabId]._id;
        // Update the instanvce variables tracking desmos state so they're fresh for the next equality check
        this.expressionList = currentState.expressions.list;
        this.graph = currentState.graph;
        socket.emit("SEND_EVENT", newData, res => {
          this.props.resetControlTimer();
        });
        // this.props.updateRoomTab(room._id, id, {
        //   // @todo consider saving an array of currentStates to make big jumps in the relpayer less laggy
        //   currentState
        // });
      }
      this.setState({ receivingEvent: false });
    });
    socket.removeAllListeners("RECEIVE_EVENT");
    socket.on("RECEIVE_EVENT", data => {
      console.log("receiving evnet: ", data);
      let { room, tabId } = this.props;
      if (data.tab === room.tabs[tabId]._id) {
        let updatedTabs = this.props.room.tabs.map(tab => {
          if (tab._id === data.tab) {
            tab.currentState = data.currentState;
          }
          return tab;
        });
        this.props.updatedRoom(this.props.room._id, { tabs: updatedTabs });
        this.props.updatedRoom(this.props.room._id, { tabs: updatedTabs });
        this.setState({ receivingEvent: true }, () => {
          this.calculator.setState(data.event);
        });
      } else {
        this.props.addNtfToTabs(data.tab);
      }
    });
  }
  /**
   * @method areDesmosStatesEqual
   * @param  {Object} newState - desmos state object return from desmos.getState
   * @return {Boolean} statesAreEqual
   * @description - compares the previous desmos state (stored as in instance variable) with the newState argument
   * It ignores changes to graph.viewport because we want users who are not in control to still be able to zoom in and out
   */

  areDesmosStatesEqual(newState) {
    console.log(newState);
    console.log(this.expressionList);
    if (newState.expressions.list.length !== this.expressionList.length) {
      console.log("expression lists are different length");
      return false;
    }
    let currentGraphProps = Object.getOwnPropertyNames(newState.graph);
    let prevGraphProps = Object.getOwnPropertyNames(this.graph);

    if (currentGraphProps.length !== prevGraphProps.length) {
      console.log("graph props have diff length");
      return false;
    }
    // I'm okay with this O = a*b because a SHOULD never be longer than 100 and b never more than 4
    for (let i = 0; i < this.expressionList.length; i++) {
      let currentExpressionProps = Object.getOwnPropertyNames(
        newState.expressions.list[i]
      );
      let prevExpressionsProps = Object.getOwnPropertyNames(
        this.expressionList[i]
      );
      if (currentExpressionProps.length !== prevExpressionsProps.length) {
        console.log("expression");
        return false;
      }
      for (let x = 0; x < currentExpressionProps.length; x++) {
        let propName = currentExpressionProps[x];
        if (
          newState.expressions.list[i][propName] !==
          this.expressionList[i][propName]
        ) {
          console.log("expressions have diff content");
          return false;
        }
      }
    }

    for (let i = 0; i < currentGraphProps.length; i++) {
      let propName = currentGraphProps[i];
      // ignore changes to viewport property
      if (
        propName !== "viewport" &&
        newState[propName] !== this.graph[propName]
      ) {
        console.log("viewport has different props");
        return false;
      }
    }
    // If we made it this far, objects
    // are considered equivalent
    return true;
  }

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
          className={classes.Graph}
          id="calculator"
          ref={this.calculatorRef}
        />
      </Aux>
    );
  }
}

export default DesmosGraph;
