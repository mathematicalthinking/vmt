import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import debounce from 'lodash/debounce';
import classes from './graph.css';
import ControlWarningModal from './ControlWarningModal';
import socket from '../../utils/sockets';
import API from '../../utils/apiRequests';
// import { updatedRoom } from '../../store/actions';
class DesmosGraph extends Component {
  state = {
    showControlWarning: false,
  };
  // Because DESMOS controls its own state we're keeping much of our "state" outside of the actual react.this.state
  // this is because we don't want to trigger rerenders...desmos does this. Yeah, yeah. yeah...this is not the react way,
  // but we're limited by Desmos and ggb
  expressionList = [];
  receivingData = false;
  graph = {};
  undoing = false;
  calculatorRef = React.createRef();

  debouncedUpdate = debounce(
    () => {
      const { room, tabId, updateRoomTab } = this.props;
      const currentStateString = JSON.stringify(this.calculator.getState());
      updateRoomTab(room._id, room.tabs[tabId]._id, {
        currentState: currentStateString,
      });
    },
    // @todo consider saving an array of currentStates to make big jumps in the relpayer less laggy
    2000,
    { trailing: true, leading: false }
  );

  componentDidMount() {
    const { room, tabId, setFirstTabLoaded } = this.props;
    const { tabs } = room;

    window.addEventListener('keydown', this.allowKeypressCheck);
    // If we have multiple desmos tabs we'll already have a Desmos object attached to the window
    // and thus we dont need to load the desmos script. Eventually abstract out the commonalities
    // between didMount and onScriptLoad into its own function to make it more DRY...but not till
    // this component is more stable
    if (window.Desmos) {
      this.initializing = true;
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
      this.initializeListeners();
      if (tabs[tabId].currentState) {
        this.calculator.setState(tabs[tabId].currentState);
      } else if (tabs[tabId].desmosLink) {
        API.getDesmos(tabs[tabId].desmosLink)
          .then((res) => {
            this.calculator.setState(res.data.result.state);
            this.initializeListeners();
          })
          // eslint-disable-next-line no-console
          .catch((err) => console.log(err));
      }
      setFirstTabLoaded();
      const desmosState = this.calculator.getState();
      this.expressionList = desmosState.expressions.list;
      this.graph = desmosState.graph;
      this.initializing = false;
    }
  }

  // componentDidUpdate(prevProps) {
  //   // if (prevProps.currentTab !== this.props.currentTab) {
  //   //   this.setState({ receivingEvent: true }, () => {
  //   //     let { room, currentTab } = this.props;
  //   //     let { tabs } = room;
  //   //     if (tabs[currentTab].currentState) {
  //   //       this.calculator.setState(tabs[currentTab].currentState);
  //   //     } else if (tabs[currentTab].desmosLink) {
  //   //       API.getDesmos(tabs[currentTab].desmosLink)
  //   //         .then(res => {
  //   //           this.calculator.setState(res.data.result.state);
  //   //           this.initializeListeners();
  //   //         })
  //   //         .catch(err => console.log(err));
  //   //     }
  //   //   });
  //   // }
  // }
  componentWillUnmount() {
    if (this.caluclator) {
      this.calculator.unobserveEvent('change');
      this.calculator.destroy();
    }
    window.removeEventListener('keydown', this.allowKeypressCheck);
  }

  allowKeypressCheck = (event) => {
    const { showControlWarning } = this.state;
    if (showControlWarning) {
      event.preventDefault();
    }
  };

  onScriptLoad = () => {
    const { room, tabId, setFirstTabLoaded } = this.props;
    const { tabs } = room;
    const { desmosLink, currentState } = tabs[tabId];
    this.initializing = true;
    if (!this.calculator) {
      this.calculator = window.Desmos.GraphingCalculator(
        this.calculatorRef.current
      );
    }
    if (currentState) {
      try {
        this.calculator.setState(currentState);
        this.initializeListeners();
      } catch (err) {
        // eslint-disable-next-line no-alert
        window.alert('the state of this room has been corrupted :(');
      }
    } else if (desmosLink) {
      // @TODO This will require some major reconfiguration / But what we shoould do is
      // when the user creates this room get teh state from the link and then just save it
      // as as event on this model.
      API.getDesmos(desmosLink)
        .then((res) => {
          try {
            this.calculator.setState(res.data.result.state);
          } catch (err) {
            // eslint-disable-next-line no-alert
            window.alert('the state of this room has been corrupted :(');
          }
          // console.
          this.initializeListeners();
        })
        // eslint-disable-next-line no-console
        .catch((err) => console.log(err));
    } else {
      this.initializeListeners();
    }
    const desmosState = this.calculator.getState();
    this.expressionList = desmosState.expressions.list;
    this.graph = desmosState.graph;
    setFirstTabLoaded();
    this.initializing = false;
  };

  initializeListeners() {
    // INITIALIZE EVENT LISTENER
    const { updatedRoom, addNtfToTabs } = this.props;
    this.calculator.observeEvent('change', () => {
      const { room, tabId, user, myColor, resetControlTimer } = this.props;
      // eslint-disable-next-line react/destructuring-assignment
      // console.log("initializing ", this.initializing);
      if (this.initializing) return;
      if (this.undoing) {
        this.undoing = false;
        return;
      }
      const currentState = this.calculator.getState();
      if (!this.receivingData) {
        const statesAreEqual = this.areDesmosStatesEqual(currentState);
        if (statesAreEqual) return;
        // we only want to listen for changes to the expressions. i.e. we want to ignore zoom-in-out changes
        if (!user.connected || room.controlledBy !== user._id) {
          this.undoing = true;
          document.activeElement.blur(); // prevent the user from typing anything else N.B. this isnt actually preventing more typing it just removes the cursor
          // we have the global keypress listener to prevent typing if controlWarning is being shown
          this.setState({ showControlWarning: true });
        }
        const currentStateString = JSON.stringify(currentState);
        // console.log(this.calculator.getState());
        const newData = {
          room: room._id,
          tab: room.tabs[tabId]._id,
          event: currentStateString,
          color: myColor,
          user: {
            _id: user._id,
            username: user.username,
          },
          timestamp: new Date().getTime(),
        };
        // Update the instanvce variables tracking desmos state so they're fresh for the next equality check
        socket.emit('SEND_EVENT', newData, () => {});
        resetControlTimer();
        // if (this.debouncedUpdate) {
        //   this.debouncedUpdate.cancel();
        // }
        this.debouncedUpdate();
      }
      this.expressionList = currentState.expressions.list;
      this.graph = currentState.graph;
      this.receivingData = false;
    });
    socket.removeAllListeners('RECEIVE_EVENT');
    socket.on('RECEIVE_EVENT', (data) => {
      const { room, tabId } = this.props;
      this.receivingData = true;
      if (data.tab === room.tabs[tabId]._id) {
        const updatedTabs = room.tabs.map((tab) => {
          if (tab._id === data.tab) {
            tab.currentState = data.currentState;
          }
          return tab;
        });
        updatedRoom(room._id, { tabs: updatedTabs });
        updatedRoom(room._id, { tabs: updatedTabs });
        this.calculator.setState(data.event);
      } else {
        addNtfToTabs(data.tab);
        this.receivingData = false;
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
    const currentGraphProps = Object.getOwnPropertyNames(newState.graph);
    const prevGraphProps = Object.getOwnPropertyNames(this.graph);

    if (currentGraphProps.length !== prevGraphProps.length) {
      return false;
    }
    // I'm okay with this O(a*b) because a SHOULD never be longer than 100 (and is usually closer to 10) and b never more than 4
    // If these assumptions change in the future we may need to refactor
    for (let i = 0; i < this.expressionList.length; i++) {
      const currentExpressionProps = Object.getOwnPropertyNames(
        newState.expressions.list[i]
      );
      const prevExpressionsProps = Object.getOwnPropertyNames(
        this.expressionList[i]
      );
      if (currentExpressionProps.length !== prevExpressionsProps.length) {
        return false;
      }
      for (let x = 0; x < currentExpressionProps.length; x++) {
        const propName = currentExpressionProps[x];
        if (
          newState.expressions.list[i][propName] !==
          this.expressionList[i][propName]
        ) {
          return false;
        }
      }
    }

    for (let i = 0; i < currentGraphProps.length; i++) {
      const propName = currentGraphProps[i];
      // ignore changes to viewport property
      if (
        propName !== 'viewport' &&
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
    const { inControl, toggleControl } = this.props;
    const { showControlWarning } = this.state;
    return (
      <Fragment>
        <span id="focus" ref={this.focus} />
        <ControlWarningModal
          showControlWarning={showControlWarning}
          toggleControlWarning={() =>
            this.setState({ showControlWarning: false })
          }
          takeControl={() => {
            this.calculator.undo();
            toggleControl();
            this.setState({ showControlWarning: false });
          }}
          inControl={inControl}
          cancel={() => {
            this.calculator.undo();
            this.setState({ showControlWarning: false });
          }}
        />
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

DesmosGraph.propTypes = {
  room: PropTypes.shape({
    controlledBy: PropTypes.string,
  }).isRequired,
  tabId: PropTypes.number.isRequired,
  user: PropTypes.shape({}).isRequired,
  myColor: PropTypes.string.isRequired,
  resetControlTimer: PropTypes.func.isRequired,
  updatedRoom: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateRoomTab: PropTypes.func.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
};

export default DesmosGraph;
