/* eslint-disable */
import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import classes from './graph.css';
import { Aux, Button } from '../../Components';
import { Player } from '../../external/js/api.full.es';
import socket from '../../utils/sockets';
import ControlWarningModal from './ControlWarningModal';
import CheckboxModal from '../../Components/UI/Modal/CheckboxModal';

// import { updatedRoom } from '../../store/actions';

function DesmosActivityGraph(props) {
  const [screenPage, setScreenPage] = useState(1);
  const [activityPlayer, setActivityPlayer] = useState();
  const [showControlWarning, setShowControlWarning] = useState(false);
  const calculatorRef = useRef(null);

  let receivingData = false;
  let undoing = false;
  let initializing = true;

  function allowKeypressCheck(event) {
    if (showControlWarning) {
      event.preventDefault();
    }
  }

  // Event listener callback on the Activity instance
  function handleResponseData(updates) {
    console.log('Updates: ', updates);
    if (initializing) return;
    const { room, user, myColor, resetControlTimer, inControl } = props;
    if (initializing) return;
    if (undoing) {
      undoing = false;
      return;
    }
    const currentState = {
      studentResponses: updates,
      timestampEpochMs: new Date().getTime(),
    };
    if (!receivingData) {
      if (inControl !== 'ME') {
        undoing = true;
        document.activeElement.blur(); // prevent the user from typing anything else N.B. this isnt actually preventing more typing it just removes the cursor
        // we have the global keypress listener to prevent typing if controlWarning is being shown
        setShowControlWarning(true);
        return;
      }
      const description = this.buildDescription(
        user.username
        // stateDifference
      );
      const currentStateString = JSON.stringify(currentState);
      // console.log(this.calculator.getState());
      const newData = {
        _id: mongoIdGenerator(),
        room: room._id,
        tab: tab._id,
        currentState: currentStateString, // desmos events use the currentState field on Event model
        color: myColor,
        user: {
          _id: user._id,
          username: user.username,
        },
        timestamp: new Date().getTime(),
        description,
      };
      // Update the instanvce variables tracking desmos state so they're fresh for the next equality check
      addToLog(newData);
      socket.emit('SEND_EVENT', newData, () => {});
      resetControlTimer();
    }
    receivingData = false;
  }

  // Handle the update of the Activity Player state
  function updateActivityState(stateData) {
    activityPlayer.dangerouslySetResponses(
      { stateData: studentResponses },
      {
        stateData: timestampEpochMs,
      }
    );
  }

  function initializeListeners() {
    // INITIALIZE EVENT LISTENER
    const { tab, updatedRoom, addNtfToTabs, addToLog } = props;

    socket.removeAllListeners('RECEIVE_EVENT');
    socket.on('RECEIVE_EVENT', (data) => {
      addToLog(data);
      const { room } = props;
      receivingData = true;
      if (data.tab === tab._id) {
        const updatedTabs = room.tabs.map((t) => {
          if (t._id === data.tab) {
            t.currentState = data.currentState;
          }
          return tab;
        });
        updatedRoom(room._id, { tabs: updatedTabs });
        // updatedRoom(room._id, { tabs: updatedTabs });
        updateActivityState(data.currentState);
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });

    const { user: propsUser } = props;
    const { settings } = propsUser;
  }

  useEffect(() => {
    // // TODO handle existing room state?
    // try {
    window.addEventListener('keydown', allowKeypressCheck());
    let link = props.tab.desmosLink;
    link = link.split('/');
    const code = link[link.length - 1];
    const URL = `https://teacher.desmos.com/activitybuilder/export/${code}`;
    console.log('adapted activity url: ', URL);
    // calling Desmos to get activity config
    async function fetchData() {
      const result = await fetch(URL, {
        headers: { Accept: 'application/json' },
      });
      const data = await result.json();
      console.log('Data: ', data);
      // const player = makePlayer(
      //   data,
      //   calculatorRef.current,
      //   handleResponseData
      // );
      const player = new Player({
        activityConfig: data,
        targetElement: calculatorRef.current,
        onResponseDataUpdated: handleResponseData,
      });
      console.log('player', player);
      setActivityPlayer(player);
      props.setFirstTabLoaded();
      initializing = false;
    }
    fetchData();

    return function cleanup() {
      if (activityPlayer) {
        activityPlayer.destroy();
      }
      window.removeEventListener('keydown', allowKeypressCheck());
    };
  }, []);

  function navigateBy(increment) {
    let page = activityPlayer.getActiveScreenIndex() + increment;
    activityPlayer.setActiveScreenIndex(page);
    setScreenPage(page + 1);
  }

  return (
    <Aux>
      <span id="focus" ref={focus} />
      <ControlWarningModal
        showControlWarning={showControlWarning}
        toggleControlWarning={() => {
          setShowControlWarning(false);
        }}
        takeControl={() => {
          // this.calculator.undo();
          props.toggleControl();
          setShowControlWarning(false);
        }}
        inControl={props.inControl}
        cancel={() => {
          // this.calculator.undo();
          setShowControlWarning(false);
        }}
        inAdminMode={props.user.inAdminMode}
      />
      <CheckboxModal
        show={props.showRefWarning}
        infoMessage={props.refWarningMsg}
        closeModal={props.closeRefWarning}
        isChecked={props.doPreventFutureRefWarnings}
        checkboxDataId="ref-warning"
        onSelect={props.togglePreventRefWarning}
      />
      <div id="activityNavigation" className={classes.ActivityNav}>
        <Button theme="Small" id="nav-left" click={() => navigateBy(-1)}>
          Prev
        </Button>
        <span id="show-screen" className={classes.Title}>
          Screen {screenPage}
        </span>
        <Button theme="Small" id="nav-right" click={() => navigateBy(1)}>
          Next
        </Button>
      </div>
      <div className={classes.Activity} id="calculatorParent">
        <div className={classes.Graph} id="calculator" ref={calculatorRef} />
      </div>
    </Aux>
  );
}

DesmosActivityGraph.propTypes = {
  room: PropTypes.shape({}).isRequired,
  tab: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  myColor: PropTypes.string.isRequired,
  resetControlTimer: PropTypes.func.isRequired,
  updatedRoom: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
  referencing: PropTypes.bool.isRequired,
  updateUserSettings: PropTypes.func,
  addToLog: PropTypes.func.isRequired,
};

export default DesmosActivityGraph;
