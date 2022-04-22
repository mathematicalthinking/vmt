/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useState, useRef, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classes from './graph.css';
import { Button } from '../../Components';
// import { Player } from '../../external/js/api.full.es';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import ControlWarningModal from './ControlWarningModal';
// import CheckboxModal from '../../Components/UI/Modal/CheckboxModal';
import { fetchConfigData } from './Tools/DesActivityHelpers';
import Modal from '../../Components/UI/Modal/Modal';
import API from '../../utils/apiRequests';

const DesmosActivity = (props) => {
  // const [screenPage, setScreenPage] = useState(1);
  // every persistent event since session started (component loaded)
  const [activityHistory, setActivityHistory] = useState({});
  // single latest persistent event
  const [activityUpdates, setActivityUpdates] = useState();
  // single latest transient event
  const [transientUpdates, setTransientUpdates] = useState();
  const [showControlWarning, setShowControlWarning] = useState(false);
  const [showConfigError, setShowConfigError] = useState('');
  const calculatorRef = useRef();
  const calculatorInst = useRef();

  let receivingData = false;
  let initializing = false;
  // trigger variable for any Desmos server response other than 200
  let configResponse;

  const { history } = props;
  const handleOnErrorClick = () => history.goBack();

  const backBtn = calculatorInst.current ? getCurrentScreen() > 0 : false;
  const fwdBtn = calculatorInst.current
    ? getCurrentScreen() < calculatorInst.current.getScreenCount() - 1
    : true;

  // function updateSavedData(updates) {
  //   setActivityHistory((oldState) => ({ ...oldState, ...updates }));
  // }

  const putState = (config) => {
    const { tab, temp, updateRoomTab, room } = props;
    const { _id } = tab;
    let responseData = {};
    // grab current state-event list
    if (tab.currentStateBase64) {
      responseData = JSON.parse(tab.currentStateBase64);
    }
    // update state-event list with new history
    responseData = { ...responseData, ...activityHistory };
    // start creating a string-based object to update the tab
    const updateObject = {
      currentStateBase64: JSON.stringify(responseData),
    };
    // get and add the current screen
    if (calculatorInst.current) {
      updateObject.currentScreen = getCurrentScreen();
    }
    if (config) {
      updateObject.startingPointBase64 = JSON.stringify(config);
    }
    API.put('tabs', _id, updateObject)
      .then(() => (temp ? {} : updateRoomTab(room._id, _id, updateObject)))
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
  // Transient Events including page changes
  useEffect(() => {
    const type = 'transient';
    if (props.inControl === 'ME') {
      handleResponseData(transientUpdates, type);
    }
  }, [transientUpdates]);

  // Event listener callback on the persistent Activity instance
  // upates gives opaque event object which is passed to the analysis engine
  // analysis engine responds with a query response object
  const handleResponseData = (updates, type) => {
    const transient = type === 'transient';
    if (initializing) return;
    // console.log('Receiving data: ', receivingData);
    const { room, user, myColor, tab, resetControlTimer } = props;
    const currentState = {
      desmosState: updates,
      screen: getCurrentScreen(),
      transient,
    };
    if (!receivingData) {
      const description = buildDescription(
        user.username,
        updates
        // stateDifference
      );

      const currentStateString = JSON.stringify(currentState);
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
      socket.emit('SEND_EVENT', newData, () => {
        // console.log(`USER: ${user.username} NEW DATA:`);
        // console.log(newData);
      });
      resetControlTimer();
      if (!currentState.transient) putState();
    }
    receivingData = false;
  };

  function initializeListeners() {
    // INITIALIZE EVENT LISTENER
    const { tab, updatedRoom, addNtfToTabs, addToLog, temp } = props;

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
        if (!temp) updatedRoom(room._id, { tabs: updatedTabs });
        // updatedRoom(room._id, { tabs: updatedTabs });
        const updatesState = JSON.parse(data.currentState);
        // let transient event handle page change
        // if (
        //   updatesState.screen !== calculatorInst.current.getActiveScreenIndex()
        // ) {
        //   setScreenPage(updatesState.screen + 1);
        //   setShowControlWarning(false);
        // }
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

  const initPlayer = async () => {
    const { tab, setFirstTabLoaded } = props;
    // look for and load prior activity data
    const { config, status } = await fetchConfigData(tab);
    const { Player } = await import('../../external/js/api.full.es');
    configResponse = status;
    const playerOptions = {
      activityConfig: config,
      targetElement: calculatorRef.current,
      onError: (err) => {
        console.error(
          err.message ? err : `PlayerAPI error: ${JSON.stringify(err, null, 2)}`
        );
      },
      // callback to handle persistent state
      onResponseDataUpdated: (responses) => {
        // milisecond timeout to ensure transient events are sent prior to persistent
        setTimeout(() => {
          setActivityUpdates(responses);
        }, 1);
        setActivityHistory((oldState) => ({ ...oldState, ...responses }));
      },
    };
    console.log('Config status: ', status);

    if (tab.currentStateBase64 && tab.currentStateBase64 !== '{}') {
      // existing event data on tab
      const { currentStateBase64, startingPointBase64, desmosLink } = tab;
      const savedData = JSON.parse(currentStateBase64);
      playerOptions.responseData = savedData;
      // in case we have data but no config, resave the configuration from link
      if (
        !startingPointBase64 ||
        (startingPointBase64 === '{}' && desmosLink)
      ) {
        putState(config);
      }
    } else {
      // first load or no events, save configuration
      putState(config);
    }
    try {
      calculatorInst.current = new Player(playerOptions);
    } catch (err) {
      console.log('Player initialization error: ', err);
      initializing = false;
      setFirstTabLoaded();
      if (!showConfigError) {
        if (playerOptions.activityConfig) {
          setShowConfigError(
            'This activity configuration has unsupported components and cannot be loaded into VMT.'
          );
        } else if (configResponse) {
          setShowConfigError(
            'This activity could not be accessed from Teacher.Desmos. Make sure the activity is publicly accessible.'
          );
        } else {
          setShowConfigError(
            'This activity could not be accessed from Teacher.Desmos. Please check the configuration code or url.'
          );
        }
      }
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
    // Go to screen last used
    if (tab.currentScreen) {
      const { currentScreen } = tab;
      calculatorInst.current.setActiveScreenIndex(currentScreen);
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
      socket.removeAllListeners('RECEIVE_EVENT');
      if (calculatorInst.current) {
        if (unsub) calculatorInst.current.unsubscribeFromSync(unsub);
        if (!calculatorInst.current.isDestroyed())
          calculatorInst.current.destroy();
      }
    };
  }, []);

  function navigateBy(increment) {
    const { onScreenChange } = props;
    const page = getCurrentScreen() + increment;
    calculatorInst.current.setActiveScreenIndex(page);
    putState();
    onScreenChange(page);
  }

  function getCurrentScreen() {
    if (calculatorInst.current) {
      return calculatorInst.current.getActiveScreenIndex();
    }
    return 0;
  }

  function getScreenCount() {
    if (calculatorInst.current) {
      return calculatorInst.current.getScreenCount();
    }
    return 0;
  }

  function _hasControl() {
    return props.inControl === 'ME';
  }

  // @TODO this could be selectively handled depending what div is clicked
  function _checkForControl() {
    // check if user is not in control and intercept event
    if (!_hasControl()) {
      // event.preventDefault();
      // event.stopPropagation();
      setShowControlWarning(true);
      // return;
    }
  }

  const _calculatorWidth = () => {
    const defaultWidth = calculatorRef.current
      ? calculatorRef.current.clientWidth - 16
      : '100%';
    /**
     * The class dcg-student-screen is documented in https://github.com/desmosinc/21pstem-desmos-api-builds/tree/march-2022-rebase/css#screen-1.
     * Unfortunately, there are potentially three divs with that class -- before, current, and after. 'Current' is always not hidden. Thus, there
     * are three ways to get the correct element: has the current-screen class, the dcg-student-screen that isn't hidden,or the dcg-student-screen marked
     * with the current-screen class. We use the third approach because it uses a documented class and, right now, reliably identifies what we want:
     * the current screen (rather than 'the screen not hidden,' which is semantically indirect).
     */
    const elements = document.querySelectorAll(
      // '.current-screen'
      // '.dcg-student-screen[aria-hidden=false]'
      '.dcg-student-screen.current-screen'
    );
    if (elements.length === 0) return defaultWidth;
    const currentScreen = elements[0];
    return currentScreen.clientWidth || defaultWidth;
  };

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
      <Modal show={!!showConfigError} closeModal={handleOnErrorClick}>
        {showConfigError}
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
      <div id="activityNavigation" className={classes.ActivityNav}>
        {_hasControl() && backBtn && (
          <Button theme="Small" id="nav-left" click={() => navigateBy(-1)}>
            Prev
          </Button>
        )}
        <span
          title="Navigation buttons only seen when in control"
          id="show-screen"
          className={classes.Title}
        >
          <div>Screen {getCurrentScreen() + 1}</div>
          <div id="screen-count" className={classes.Screens}>
            of {getScreenCount()}
          </div>
        </span>
        {_hasControl() && fwdBtn && (
          <Button theme="Small" id="nav-right" click={() => navigateBy(1)}>
            Next
          </Button>
        )}
      </div>
      <div className={classes.Activity}>
        <div className={classes.Graph} id="calculator" ref={calculatorRef} />
        {!_hasControl() && (
          <div
            className={classes.Control}
            onClick={_checkForControl}
            onKeyPress={_checkForControl}
            tabIndex="-1"
            role="button"
            style={{
              width: _calculatorWidth() || '100%',
            }}
          />
        )}
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
  onScreenChange: PropTypes.func,
  temp: PropTypes.bool,
};

DesmosActivity.defaultProps = {
  onScreenChange: () => {},
  temp: false,
};

export default withRouter(DesmosActivity);
