/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useState, useRef, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classes from './graph.css';
import { Button } from '../../Components';
import { Player } from '../../external/js/api.full.es';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import ControlWarningModal from './ControlWarningModal';
// import CheckboxModal from '../../Components/UI/Modal/CheckboxModal';
import Modal from '../../Components/UI/Modal/Modal';
import API from '../../utils/apiRequests';

const DesmosActivity = (props) => {
  const [screenPage, setScreenPage] = useState(1);
  // every persistent event since session started (component loaded)
  const [activityHistory, setActivityHistory] = useState({});
  // single latest persistent event
  const [activityUpdates, setActivityUpdates] = useState();
  // single latest transient event
  const [transientUpdates, setTransientUpdates] = useState();
  const [showControlWarning, setShowControlWarning] = useState(false);
  const [showConfigError, setShowConfigError] = useState(false);
  const calculatorRef = useRef();
  const calculatorInst = useRef();

  let receivingData = false;
  let initializing = false;

  const { history } = props;
  const handleOnErrorClick = () => history.goBack();

  const backBtn = calculatorInst.current
    ? calculatorInst.current.getActiveScreenIndex() > 0
    : false;
  const fwdBtn = calculatorInst.current
    ? calculatorInst.current.getActiveScreenIndex() <
      calculatorInst.current.getScreenCount() - 1
    : true;

  // function updateSavedData(updates) {
  //   setActivityHistory((oldState) => ({ ...oldState, ...updates }));
  // }

  const putState = () => {
    const { tab, updateRoomTab, room } = props;
    const { _id } = tab;
    let responseData = {};
    if (tab.currentStateBase64) {
      responseData = JSON.parse(tab.currentStateBase64);
    }
    // eslint-disable-next-line array-callback-return
    // Object.entries(activityHistory).map(([key, value]) => {
    //   responseData[key] = [value];
    // });

    responseData = { ...responseData, ...activityHistory };

    const updateObject = {
      currentStateBase64: JSON.stringify(responseData),
    };
    if (calculatorInst.current) {
      updateObject.currentScreen = calculatorInst.current.getActiveScreenIndex();
    }
    console.log('Update object: ', updateObject);
    API.put('tabs', _id, updateObject)
      .then(() => updateRoomTab(room._id, _id, updateObject))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  // eslint-disable-next-line no-unused-vars
  const buildDescription = (username, updates) => {
    // @TODO clean up and parse activity types
    // examples below
    // anzook {"studentResponses":{"031cd62f-363b-4dd1-aa21-6bbd676ee7b3":"{\"numericValue\":null}"},"timestampEpochMs":1614013897960}
    // anzook {"studentResponses":{"5fd0bf7a-c15d-43cc-95d0-952f52959e10":"{\"cells\":{\"c378111f-512d-4b68-956a-63e791e9a656\":{},\"423ebdc4-740a-4027-96cb-77db80932879\":{},\"b8dea663-31f5-4290-b94a-7c2083728231\":{\"content\":\"5\",\"numericValue\":5},\"60feee66-3bc8-4dc4-af2c-1e6bf16d75dd\":{}},\"rowIds\":[\"83b6c205-0acb-447a-ad35-d3a97182f702\",\"862ada77-692a-41ee-af04-9cba45cdfa11\"],\"rows\":{\"83b6c205-0acb-447a-ad35-d3a97182f702\":[\"c378111f-512d-4b68-956a-63e791e9a656\",\"423ebdc4-740a-4027-96cb-77db80932879\"],\"862ada77-692a-41ee-af04-9cba45cdfa11\":[\"b8dea663-31f5-4290-b94a-7c2083728231\",\"60feee66-3bc8-4dc4-af2c-1e6bf16d75dd\"]},\"columnTypes\":[0,0],\"fullyEditable\":true,\"canAddRows\":true,\"tableSubmitted\":false,\"updated\":true}"},"timestampEpochMs":1614014048516}
    //  let eventDetails = JSON.stringify(updates[updates.keys(updates)[0]]);
    // let eventDetails = JSON.stringify(updates);
    // return `${username}: ${eventDetails}`;
    return `${username} interacted with the Activity`;
  };

  // listener and event state handlers
  // Persistent Events
  useEffect(() => {
    const type = 'persistent';
    if (props.inControl === 'ME') {
      handleResponseData(activityUpdates, type);
    }
  }, [activityUpdates]);
  // Transient Events
  useEffect(() => {
    const type = 'transient';
    if (props.inControl === 'ME') {
      handleResponseData(transientUpdates, type);
    }
  }, [transientUpdates]);

  // Event listener callback on the persistent Activity instance
  const handleResponseData = (updates, type) => {
    // console.log('Screenpage(state): ', screenPage, ' Tab data: ', tab);
    const transient = type === 'transient';
    if (initializing) return;
    // console.log('Receiving data: ', receivingData);
    const { room, user, myColor, tab, resetControlTimer } = props;
    const currentState = {
      desmosState: updates,
      screen: screenPage - 1,
      transient,
    };
    if (!receivingData) {
      const description = buildDescription(
        user.username,
        updates
        // stateDifference
      );
      console.log('Sent state: ', currentState);

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
      if (!currentState.transient) putState();
    }
    receivingData = false;
  };

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
        const updatesState = JSON.parse(data.currentState);
        console.log('Received state: ', updatesState);
        if (
          updatesState.screen !== calculatorInst.current.getActiveScreenIndex()
        ) {
          setScreenPage(updatesState.screen + 1);
          setShowControlWarning(false);
        }
        // set persistent state
        if (updatesState.desmosState && !updatesState.transient) {
          calculatorInst.current.dangerouslySetResponses(
            updatesState.desmosState
          );
        } else if (updatesState.desmosState && updatesState.transient) {
          calculatorInst.current.handleSyncEvent(updatesState.desmosState);
        }
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });
    // const { user: propsUser } = props;
    // const { settings } = propsUser;
  }

  const fetchData = async () => {
    const { tab, setFirstTabLoaded } = props;
    const code =
      tab.desmosLink ||
      // fallback to turtle time trials, used for demo
      '5da9e2174769ea65a6413c93';
    const URL = `https://teacher.desmos.com/activitybuilder/export/${code}`;
    console.log('adapted activity url: ', URL);
    // calling Desmos to get activity config
    const result = await fetch(URL, {
      headers: { Accept: 'application/json' },
    });
    console.log('Result: ', result);
    if (result.status !== 200) {
      initializing = false;
      setFirstTabLoaded();
      setShowConfigError(true);
    }

    const data = await result.json();
    return data;
  };

  const initPlayer = async () => {
    const { tab, setFirstTabLoaded } = props;
    const playerOptions = {
      activityConfig: await fetchData(),
      targetElement: calculatorRef.current,
      onError: (err) => {
        console.error(
          err.message ? err : `PlayerAPI error: ${JSON.stringify(err, null, 2)}`
        );
      },
      // callback to handle persistent state
      onResponseDataUpdated: (responses) => {
        setActivityUpdates(responses);
        setActivityHistory((oldState) => ({ ...oldState, ...responses }));
      },
    };
    if (tab.currentStateBase64) {
      const { currentStateBase64 } = tab;
      const savedData = JSON.parse(currentStateBase64);
      // console.log('Prior state data loaded: ');
      // console.log(savedData);
      playerOptions.responseData = savedData;
    }

    try {
      calculatorInst.current = new Player(playerOptions);
    } catch (err) {
      console.log('Player initialization error: ', err);
      initializing = false;
      setFirstTabLoaded();
      setShowConfigError(true);
      return null;
    }

    // callback method to handle transient state
    // eslint-disable-next-line no-unused-vars
    const unsubToken = calculatorInst.current.subscribeToSync((evnt) => {
      setTransientUpdates(evnt);
    });
    console.log(
      'Desmos Activity Player initialized Version: ',
      Player.version(),
      'Player instance: ',
      calculatorInst.current
    );
    props.setFirstTabLoaded();
    initializeListeners();
    // Print current Tab data
    // console.log('Tab data: ', props.tab);
    // Go to screen last used
    if (tab.currentScreen) {
      const { currentScreen } = tab;
      console.log('Prior screen index loaded: ', currentScreen);
      calculatorInst.current.setActiveScreenIndex(currentScreen);
      setScreenPage(currentScreen + 1);
    }
    return unsubToken;
  };

  useEffect(() => {
    initializing = true;
    let unsub;
    initPlayer().then((token) => {
      unsub = token;
    });
    initializing = false;
    return () => {
      if (calculatorInst.current) {
        if (unsub) calculatorInst.current.unsubscribeFromSync(unsub);
        calculatorInst.current.destroy();
      }
      // sessionStorage.clear();  @TODO Is this leftover from somewhere?
    };
  }, []);

  function navigateBy(increment) {
    const page = calculatorInst.current.getActiveScreenIndex() + increment;
    calculatorInst.current.setActiveScreenIndex(page);
    setScreenPage(page + 1);
    putState();
  }

  function _hasControl() {
    return props.inControl === 'ME';
  }

  // @TODO this could be selectively handled depending what div is clicked
  function _checkForControl(event) {
    // check if user is not in control and intercept event
    // console.log('Click intercepted - Event: ', event.target.id);
    if (!_hasControl()) {
      event.preventDefault();
      setShowControlWarning(true);
      // return;
    }
  }

  const {
    inControl,
    user,
    // @TODO **NONE OF THESE PROPS ARE RECEIVED RIGHT NOW **
    // showRefWarning,
    // refWarningMsg,
    // closeRefWarning,
    // doPreventFutureRefWarnings,
    // togglePreventRefWarning,
  } = props;
  return (
    <Fragment>
      <Modal show={showConfigError} closeModal={handleOnErrorClick}>
        {' '}
        Error retrieving Activity Configuration, please make sure this activity
        is publiclly accessible and supported in VMT
      </Modal>
      <ControlWarningModal
        showControlWarning={showControlWarning}
        toggleControlWarning={() => {
          setShowControlWarning(false);
        }}
        takeControl={() => {
          props.toggleControl();
          setShowControlWarning(false);
        }}
        inControl={inControl}
        cancel={() => {
          setShowControlWarning(false);
        }}
        inAdminMode={user ? user.inAdminMode : false}
      />
      {/* @TODO None of the needed props are received right now
      <CheckboxModal
        show={showRefWarning}
        infoMessage={refWarningMsg}
        closeModal={closeRefWarning}
        isChecked={doPreventFutureRefWarnings}
        checkboxDataId="ref-warning"
        onSelect={togglePreventRefWarning}
      /> */}
      <div
        id="activityNavigation"
        className={classes.ActivityNav}
        onClickCapture={_checkForControl}
        style={{
          pointerEvents: !_hasControl() ? 'none' : 'auto',
        }}
      >
        {_hasControl() && backBtn && (
          <Button theme="Small" id="nav-left" click={() => navigateBy(-1)}>
            Prev
          </Button>
        )}
        <span id="show-screen" className={classes.Title}>
          Screen {screenPage}
        </span>
        {_hasControl() && fwdBtn && (
          <Button theme="Small" id="nav-right" click={() => navigateBy(1)}>
            Next
          </Button>
        )}
      </div>
      <div
        className={classes.Activity}
        onClickCapture={_checkForControl}
        id="calculatorParent"
        style={{
          height: '890px', // @TODO this needs to be adjusted based on the Player instance.
        }}
      >
        <div
          className={classes.Graph}
          id="calculator"
          ref={calculatorRef}
          style={{
            overflow: 'auto',
            pointerEvents: !_hasControl() ? 'none' : 'auto',
          }}
        />
      </div>
    </Fragment>
  );
};

DesmosActivity.propTypes = {
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
  // referencing: PropTypes.bool.isRequired,
  // updateUserSettings: PropTypes.func,
  addToLog: PropTypes.func.isRequired,
};

export default withRouter(DesmosActivity);
