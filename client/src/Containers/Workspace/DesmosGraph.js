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

  calculatorRef = React.createRef();

  componentDidMount() {
    console.log("desmos graph mounted");
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
    console.log("script laoded???");
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
      this.initializeListeners();
    }
    this.props.setFirstTabLoaded();
  };

  // componentWillUnmount(){
  //   console.log("componentUNMOUNTING")
  // }

  initializeListeners() {
    // INITIALIZE EVENT LISTENER
    let { room, tabId, user } = this.props;
    this.calculator.observeEvent("change", event => {
      if (!this.state.receivingEvent) {
        if (!user.connected || room.controlledBy !== user._id) {
          this.calculator.undo();
          return alert(
            "You are not in control. The update you just made will not be saved. Please refresh the page"
          );
        }
        let currentState = JSON.stringify(this.calculator.getState());
        const newData = {
          room: room._id,
          tab: room.tabs[tabId]._id,
          event: currentState,
          user: {
            _id: user._id,
            username: user.username
          },
          timestamp: new Date().getTime()
        };
        let id = room.tabs[tabId]._id;
        socket.emit("SEND_EVENT", newData, res => {
          this.props.resetControlTimer();
        });
        this.props.updateRoomTab(room._id, id, {
          // @todo consider saving an array of currentStates to make big jumps in the relpayer less laggy
          currentState
        });
      }
      this.setState({ receivingEvent: false });
    });
    socket.removeAllListeners("RECEIVE_EVENT");
    socket.on("RECEIVE_EVENT", data => {
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
          this.calculator.setState(data.currentState);
        });
      } else {
        this.props.addNtfToTabs(data.tab);
      }
    });
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
