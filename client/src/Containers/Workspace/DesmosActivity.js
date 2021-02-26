/* eslint-disable */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import classes from './graph.css';
import { Aux, Button } from '../../Components';
import { Player } from '../../external/js/api.full.es';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import ControlWarningModal from './ControlWarningModal';
import CheckboxModal from '../../Components/UI/Modal/CheckboxModal';
import API from '../../utils/apiRequests';
// import { update } from '../../../../server/models/Tab';

// import { updatedRoom } from '../../store/actions';

const DesmosActivityGraph = (props) => {
  const [screenPage, setScreenPage] = useState(1);
  const [activityHistory, setActivityHistory] = useState({});
  const [activityUpdates, setActivityUpdates] = useState();
  const [showControlWarning, setShowControlWarning] = useState(false);
  const calculatorRef = useRef();
  const calculatorInst = useRef();

  let receivingData = false;
  let undoing = false;
  let initializing = false;

  function updateSavedData(updates) {
    // TODO refactor using state
    // Can this be done without a FOR loop/single update?
    setActivityHistory((oldState) => ({ ...oldState, ...updates }));
    // sessionStorage.setItem(keyPrefix + key, updates[key]);
  }

  const debouncedUpdate = debounce(
    () => {
      const { tab } = props;
      const { _id } = tab;
      let responseData = {};
      if (tab.currentStateBase64) {
        responseData = JSON.parse(tab.currentStateBase64);
      }
      Object.entries(activityHistory).map(([key, value]) => {
        responseData[key] = [value];
      });

      // updateRoomTab(room._id, tab._id, {
      //   currentState: currentStateString,
      // });
      const currentStateBase64 = JSON.stringify(responseData);
      // console.log('API sent state: ', { currentStateBase64 });
      API.put('tabs', _id, { currentStateBase64 })
        .then(() => {})
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    },
    // @todo consider saving an array of currentStates to make big jumps in the relpayer less laggy
    2000,
    { trailing: true, leading: false }
  );

  function allowKeypressCheck(event) {
    if (showControlWarning) {
      event.preventDefault();
    }
  }

  let buildDescription = (username, updates) => {
    // @TODO clean up and parse activity types
    // examples below
    // anzook {"studentResponses":{"031cd62f-363b-4dd1-aa21-6bbd676ee7b3":"{\"numericValue\":null}"},"timestampEpochMs":1614013897960}
    // anzook {"studentResponses":{"5fd0bf7a-c15d-43cc-95d0-952f52959e10":"{\"cells\":{\"c378111f-512d-4b68-956a-63e791e9a656\":{},\"423ebdc4-740a-4027-96cb-77db80932879\":{},\"b8dea663-31f5-4290-b94a-7c2083728231\":{\"content\":\"5\",\"numericValue\":5},\"60feee66-3bc8-4dc4-af2c-1e6bf16d75dd\":{}},\"rowIds\":[\"83b6c205-0acb-447a-ad35-d3a97182f702\",\"862ada77-692a-41ee-af04-9cba45cdfa11\"],\"rows\":{\"83b6c205-0acb-447a-ad35-d3a97182f702\":[\"c378111f-512d-4b68-956a-63e791e9a656\",\"423ebdc4-740a-4027-96cb-77db80932879\"],\"862ada77-692a-41ee-af04-9cba45cdfa11\":[\"b8dea663-31f5-4290-b94a-7c2083728231\",\"60feee66-3bc8-4dc4-af2c-1e6bf16d75dd\"]},\"columnTypes\":[0,0],\"fullyEditable\":true,\"canAddRows\":true,\"tableSubmitted\":false,\"updated\":true}"},"timestampEpochMs":1614014048516}
    //  let eventDetails = JSON.stringify(updates[updates.keys(updates)[0]]);
    let eventDetails = JSON.stringify(updates);
    // return `${username}: ${eventDetails}`;
    return `${username} interacted with the Activity`;
  };

  // listener debugger to follow warming modal
  // useEffect(() => {
  //   console.log('Warning listener: ', showControlWarning);
  //   console.log('and control is currently ', props.inControl);
  // }, [showControlWarning]);

  useEffect(() => {
    // console.log('~~~~~~activityUpdate listener~~~~~~~~~');
    // console.log("Updates...: ", activityUpdates);
    handleResponseData(activityUpdates);
  }, [activityUpdates, screenPage]);

  // Event listener callback on the Activity instance
  const handleResponseData = (updates) => {
    if (initializing) return;
    let { room, user, myColor, tab, resetControlTimer, inControl } = props;
    if (undoing) {
      undoing = false;
      return;
    }

    const currentState = {
      desmosState: updates,
      screen: screenPage - 1,
    };
    if (!receivingData) {
      // console.log(
      //   '**** Updates: ',
      //   currentState,
      //   ', Controlled by: ',
      //   inControl,
      //   ' ****'
      // );
      // console.log('On page: ', screenPage);
      if (inControl !== 'ME') {
        undoing = true;
        document.activeElement.blur(); // prevent the user from typing anything else N.B. this isnt actually preventing more typing it just removes the cursor
        // we have the global keypress listener to prevent typing if controlWarning is being shown
        setShowControlWarning(true);
        return;
      }
      let description = buildDescription(
        user.username,
        updates
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
      props.addToLog(newData);
      socket.emit('SEND_EVENT', newData, () => {});
      resetControlTimer();
      debouncedUpdate();
    }
    receivingData = false;
  };

  // Handle the update of the Activity Player state
  function updateActivityState(stateData) {
    // let newState = JSON.parse(stateData);
    if (stateData) {
      let newState = stateData;
      // console.log('Updating this player: ', calculatorInst.current);
      // console.log('Received this data: ', newState);
      calculatorInst.current.dangerouslySetResponses(
        newState.studentResponses,
        {
          timestampEpochMs: newState.timestampEpochMs,
        }
      );
    }
  }

  function initializeListeners() {
    // INITIALIZE EVENT LISTENER
    const { tab, updatedRoom, addNtfToTabs, addToLog } = props;

    socket.removeAllListeners('RECEIVE_EVENT');
    socket.on('RECEIVE_EVENT', (data) => {
      // console.log('Socket: Received data: ', data);
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
        let updatesState = JSON.parse(data.currentState);
        // console.log('Received data: ', updatesState);
        updateActivityState(updatesState.desmosState);
        if (
          updatesState.screen !== calculatorInst.current.getActiveScreenIndex()
        ) {
          calculatorInst.current.setActiveScreenIndex(updatesState.screen);
          setScreenPage(updatesState.screen + 1);
          setShowControlWarning(false);
        }
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });
    // const { user: propsUser } = props;
    // const { settings } = propsUser;
  }

  const fetchData = useCallback(async () => {
    initializing = true;
    window.addEventListener('keydown', allowKeypressCheck());
    let code =
      props.tab.desmosLink ||
      // fallback to turtle time trials, used for demo
      '5da9e2174769ea65a6413c93';
    const URL = `https://teacher.desmos.com/activitybuilder/export/${code}`;
    console.log('adapted activity url: ', URL);
    // calling Desmos to get activity config
    const result = await fetch(URL, {
      headers: { Accept: 'application/json' },
    });
    const data = await result.json();
    // console.log('Data: ', data);
    let playerOptions = {
      activityConfig: data,
      targetElement: calculatorRef.current,
      onResponseDataUpdated: (responses) => {
        const currentState = {
          studentResponses: responses,
          timestampEpochMs: new Date().getTime(),
        };
        // console.log('Responses updated: ', responses);
        setActivityUpdates(currentState);
        updateSavedData(responses);
      },
    };
    if (props.tab.currentStateBase64) {
      const { tab } = props;
      let { currentStateBase64 } = tab;
      let savedData = JSON.parse(currentStateBase64);
      console.log('Prior state data loaded: ');
      console.log(savedData);
      // for (let prefixedKey of Object.keys(savedData)) {
      //   if (!prefixedKey.startsWith(keyPrefix)) continue;
      //   let responseDataKey = prefixedKey.slice(keyPrefix.length);
      //   responseData[responseDataKey] = savedData[prefixedKey];
      // }
      // console.log('Initial response data:');
      // console.log(responseData);
      // updateActivityState(props.tab.currentState);
      playerOptions.responseData = savedData;
    }

    calculatorInst.current = new Player(playerOptions);

    // console.log('player', player);
    // setActivityPlayer(player);
    console.log(
      'Desmos Activity Player initialized Version: ',
      Player.version(),
      'Player instance: ',
      calculatorInst.current
    );
    props.setFirstTabLoaded();
    initializing = false;
    initializeListeners();
  });

  useEffect(() => {
    // // TODO handle existing room state?
    fetchData();
    return function cleanup() {
      if (calculatorInst.current) {
        calculatorInst.current.destroy();
      }
      window.removeEventListener('keydown', allowKeypressCheck());
      sessionStorage.clear();
    };
  }, []);

  function navigateBy(increment) {
    if (props.inControl !== 'ME') {
      undoing = true;
      document.activeElement.blur(); // prevent the user from typing anything else N.B. this isnt actually preventing more typing it just removes the cursor
      // we have the global keypress listener to prevent typing if controlWarning is being shown
      setShowControlWarning(true);
      return;
    } else {
      // console.log('changing page for ', calculatorInst.current);
      let page = calculatorInst.current.getActiveScreenIndex() + increment;
      calculatorInst.current.setActiveScreenIndex(page);
      setScreenPage(page + 1);
    }
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
          props.toggleControl();
          setShowControlWarning(false);
        }}
        inControl={props.inControl}
        cancel={() => {
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
};

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
