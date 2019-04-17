import React, { Component, Fragment } from "react";
import classes from "./graph.css";
import Modal from "../../Components/UI/Modal/Modal";
import Button from "../../Components/UI/Button/Button";
import Script from "react-load-script";
import socket from "../../utils/sockets";
import API from "../../utils/apiRequests";
// import { updatedRoom } from '../../store/actions';
class DesmosGraph extends Component {
  state = {
    receivingEvent: false, // @TODO experiment with moving this out of state with the other instance vars
    showControlWarning: false
  };
  // Because DESMOS controls its own state we're keeping much of our "state" outside of the actual react.this.state
  // this is because we don't want to trigger rerenders...desmos does this. Yeah, yeah. yeah...this is not the react way,
  // but we're limited by Desmos and ggb
  expressionList = [];
  graph = {};
  undoing = false;
  calculatorRef = React.createRef();

  componentDidMount() {
    window.addEventListener("keydown", this.allowKeypressCheck);
    // If we have multiple desmos tabs we'll already have a Desmos object attached to the window
    // and thus we dont need to load the desmos script. Eventually abstract out the commonalities
    // between didMount and onScriptLoad into its own function to make it more DRY...but not till
    // this component is more stable
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
      let desmosState = this.calculator.getState();
      this.expressionList = desmosState.expressions.list;
      this.graph = desmosState.graph;
    }
  }

  allowKeypressCheck = event => {
    if (this.state.showControlWarning) {
      event.preventDefault();
    }
  };

  componentWillUnmount() {
    delete window.Demsmos;
    if (this.caluclator) {
      this.calculator.unobserveEvent("change");
      this.calculator.destroy();
    }
    window.removeEventListener("keydown", this.allowKeypressCheck);
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
      try {
        this.calculator.setState(currentState);
        this.initializeListeners();
      } catch (err) {
        alert("the state of this room has been corrupted :(");
      }
    } else if (desmosLink) {
      // @TODO This will require some major reconfiguration / But what we shoould do is
      // when the user creates this room get teh state from the link and then just save it
      // as as event on this model.
      API.getDesmos(desmosLink)
        .then(res => {
          try {
            this.calculator.setState(res.data.result.state);
          } catch (err) {
            alert("the state of this room has been corrupted :(");
          }
          // console.
          this.initializeListeners();
        })
        .catch(err => console.log(err));
    } else {
      this.initializeListeners();
    }
    let desmosState = this.calculator.getState();
    this.expressionList = desmosState.expressions.list;
    this.graph = desmosState.graph;
    this.props.setFirstTabLoaded();
    this.initializing = false;
  };

  initializeListeners() {
    // INITIALIZE EVENT LISTENER
    this.calculator.observeEvent("change", event => {
      // console.log("initializing ", this.initializing);
      if (this.initializing) return;
      if (this.undoing) {
        this.undoing = false;
        return;
      }
      let { room, tabId, user } = this.props;
      let currentState = this.calculator.getState();
      if (!this.state.receivingEvent) {
        let statesAreEqual = this.areDesmosStatesEqual(currentState);
        console.log("states are equal: ", statesAreEqual);
        if (statesAreEqual) return;
        // we only want to listen for changes to the expressions. i.e. we want to ignore zoom-in-out changes
        if (!user.connected || room.controlledBy !== user._id) {
          this.undoing = true;
          document.activeElement.blur(); // prevent the user from typing anything else N.B. this isnt actually preventing more typing it just removes the cursor
          // we have the global keypress listener to prevent typing if controlWarning is being shown
          return this.setState({ showControlWarning: true });
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
        // let id = room.tabs[tabId]._id;
        // Update the instanvce variables tracking desmos state so they're fresh for the next equality check
        socket.emit("SEND_EVENT", newData, res => {
          this.props.resetControlTimer();
        });
        // this.props.updateRoomTab(room._id, id, {
        //   // @todo consider saving an array of currentStates to make big jumps in the relpayer less laggy
        //   currentState
        // });
      }
      this.expressionList = currentState.expressions.list;
      this.graph = currentState.graph;
      this.setState({ receivingEvent: false });
    });
    socket.removeAllListeners("RECEIVE_EVENT");
    socket.on("RECEIVE_EVENT", data => {
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
    if (newState.expressions.list.length !== this.expressionList.length) {
      return false;
    }
    let currentGraphProps = Object.getOwnPropertyNames(newState.graph);
    let prevGraphProps = Object.getOwnPropertyNames(this.graph);

    if (currentGraphProps.length !== prevGraphProps.length) {
      return false;
    }
    // I'm okay with this O(a*b) because a SHOULD never be longer than 100 (and is usually closer to 10) and b never more than 4
    // If these assumptions change in the future we may need to refactor
    for (let i = 0; i < this.expressionList.length; i++) {
      let currentExpressionProps = Object.getOwnPropertyNames(
        newState.expressions.list[i]
      );
      let prevExpressionsProps = Object.getOwnPropertyNames(
        this.expressionList[i]
      );
      if (currentExpressionProps.length !== prevExpressionsProps.length) {
        return false;
      }
      for (let x = 0; x < currentExpressionProps.length; x++) {
        let propName = currentExpressionProps[x];
        if (
          newState.expressions.list[i][propName] !==
          this.expressionList[i][propName]
        ) {
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
        return false;
      }
    }
    // If we made it this far, objects
    // are considered equivalent
    return true;
  }

  render() {
    console.log("control: ", this.props.inControl);
    return (
      <Fragment>
        <span id="focus" ref={this.focus} />
        <Modal
          show={this.state.showControlWarning}
          closeModal={() => this.setState({ showControlWarning: false })}
        >
          <div>
            You can't make updates when you're not in control click "Take
            Control" first.
          </div>
          <div>
            <Button
              m={5}
              click={() => {
                this.calculator.undo();
                this.props.toggleControl();
                this.setState({ showControlWarning: false });
              }}
            >
              {this.props.inControl === "NONE"
                ? "Take Control"
                : "Request Control"}
            </Button>
            <Button
              theme="Cancel"
              m={5}
              click={() => {
                this.calculator.undo();
                this.setState({ showControlWarning: false });
              }}
            >
              Cancel
            </Button>
          </div>
        </Modal>
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
      </Fragment>
    );
  }
}

export default DesmosGraph;
