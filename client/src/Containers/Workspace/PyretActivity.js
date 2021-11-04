import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import ControlWarningModal from './ControlWarningModal';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import API from '../../utils/apiRequests';
import classes from './graph.css';

const CodePyretOrg = (props) => {
  const [activityHistory, setActivityHistory] = useState({});
  const [activityUpdates, setActivityUpdates] = useState();
  const [showControlWarning, setShowControlWarning] = useState(false);
  const [iframeSrc, setIframeSrc] = useState(
    process.env.REACT_APP_PYRET_URL ||
      'https://pyret-horizon.herokuapp.com/editor'
  );
  const cpoIframe = useRef();
  const cpoDivWrapper = useRef();
  let pyret = null;

  let receivingData = false;
  let initializing = false;

  function PyretAPI(iframeReference, onmessageHandler) {
    const oldOnMessage = window.onmessage;
    const handlers = {
      onmessage: onmessageHandler,
      postMessage,
      setParams,
    };
    function postMessage(data) {
      if (!iframeReference()) {
        return;
      }
      iframeReference().contentWindow.postMessage(data, '*');
    }
    function setParams(params) {
      console.log(params, iframeReference());
      // Test to see if this forces an iframe refresh
      setIframeSrc(`${process.env.REACT_APP_PYRET_URL}${params}`);
      // const pyretWindow = iframeReference();
      // pyretWindow.src += params;
      // forcing iFrame reload with random param
      // const rand = Math.floor(Math.random() * 1000000 + 1);
      // eslint-disable-next-line
      // pyretWindow.src += '?uid=' + rand + params;
    }
    window.onmessage = function(event) {
      if (event.data.protocol !== 'pyret') {
        console.log('Not a pyret');
        if (typeof oldOnMessage === 'function') {
          return oldOnMessage(event);
        }
      }
      return handlers.onmessage(event.data);
    };
    return handlers;
  }

  function updateSavedData(updates) {
    setActivityHistory((oldState) => ({ ...oldState, ...updates }));
  }

  // Janky copied code by Joe that needs revisiting
  const putState = () => {
    const { tab } = props;
    const { _id } = tab;
    let responseData = {};
    if (tab.currentStateBase64) {
      responseData = JSON.parse(tab.currentStateBase64);
    }
    // eslint-disable-next-line array-callback-return
    Object.entries(activityHistory).map(([key, value]) => {
      responseData[key] = [value];
    });

    const updateObject = {
      currentStateBase64: JSON.stringify(responseData),
    };
    API.put('tabs', _id, updateObject).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
  };

  const buildDescription = (username, updates) => {
    console.log('Building description of', updates);
    return `${username} updated the program`;
  };

  useEffect(() => {
    if (_hasControl()) {
      handleResponseData(activityUpdates);
    }
  }, [activityUpdates]);

  const handleResponseData = (updates) => {
    console.log("Response data processing: ", updates);
    if (initializing) return;
    const { room, user, myColor, tab, resetControlTimer } = props;
    const currentState = {
      cpoState: updates,
    };
    if (!receivingData) {
      const description = buildDescription(
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
      putState();
    }
    receivingData = false;
  };

  function updateActivityState(stateData) {
    // let newState = JSON.parse(stateData);
    if (stateData) {
      const newState = stateData;
      pyret.postMessage(newState.data);
    }
  }

  function initializeListeners() {
    // INITIALIZE EVENT LISTENER
    const { tab, updatedRoom, addNtfToTabs, addToLog } = props;

    socket.removeAllListeners('RECEIVE_EVENT');
    socket.on('RECEIVE_EVENT', (data) => {
      console.log('Socket: Received data: ', data);
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
        // console.log('Received data: ', updatesState);
        // set persistent state
        updateActivityState(updatesState.cpoState);
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });
    // const { user: propsUser } = props;
    // const { settings } = propsUser;
  }

  const initPlayer = async () => {
    const { tab } = props;
    // TODO(joe): saved data?
    initializeListeners();
    // Print current Tab data
    console.log('Tab data: ', props.tab);

    const onMessage = function(data) {
      if (
        data.source === 'react-devtools-bridge' ||
        data.source === 'react-devtools-content-script'
      )
        return;
      console.log('Got a message VMT side', data);
      const currentState = {
        data,
        timestampEpochMs: new Date().getTime(),
      };
      // console.log('Responses updated: ', responses);
      setActivityUpdates(currentState);
      updateSavedData(data);
    };

    pyret = PyretAPI(function() {
      return cpoIframe.current;
    }, onMessage);

    if (tab.currentStateBase64) {
      const { currentStateBase64 } = tab;
      const savedData = JSON.parse(currentStateBase64);
      console.log('Prior state data loaded: ');
      console.log(savedData);
      const hasSaved = savedData.data && savedData.data.length > 0;
      let contents = hasSaved ? savedData.data[0].currentState : '';
      contents = encodeURIComponent(contents);
      pyret.setParams(`#warnOnExit=false&editorContents=${contents}`);
      // #warnOnExit=false&editorContents=use%20context%20essentials2021%0A%0Ax%20%3D%205%0A%0Ax%0A
      /*
      pyret.postMessage({
        protocol: 'pyret',
        data: {
          type: 'setContents',
          text: contents
        },
      });
      */
    }
    props.setFirstTabLoaded();

    window.tryItOut = function() {
      const change = {
        from: { line: 0, ch: 0 },
        to: { line: 0, ch: 0 },
        text: ['Startup'],
      };
      pyret.postMessage({ type: 'change', change });
    };
  };

  useEffect(() => {
    initializing = true;
    initPlayer();
    initializing = false;
    return () => {
      console.log('CPO activity ending');
    };
  }, []);

  function _hasControl() {
    return props.inControl === 'ME';
  }
  function _checkForControl(event) {
    if (!_hasControl()) {
      event.preventDefault();
      setShowControlWarning(true);
    }
  }

  const style = {
    width: '100%',
    height: '100%',
    pointerEvents: !_hasControl() ? 'none' : 'auto',
  };
  const { inControl, user } = props;

  return (
    <Fragment>
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
        inAdminMode={user.inAdminMode}
      />

      <div
        className={classes.Activity}
        onClickCapture={_checkForControl}
        id="containerParent"
        style={{
          height: '890px', // @TODO this needs to be adjusted based on the editor instance.
        }}
      >
        <div
          ref={cpoDivWrapper}
          // style={{ height: '100%' }}
          id="container"
          style={{
            pointerEvents: !_hasControl() ? 'none' : 'auto',
            height: '100%',
            overflow: 'auto',
          }}
        >
          <iframe
            ref={cpoIframe}
            style={style}
            title="pyret"
            src={iframeSrc} // "http://localhost:5000/editor"
          />
          ;
        </div>
      </div>
    </Fragment>
  );
};

CodePyretOrg.propTypes = {
  room: PropTypes.shape({}).isRequired,
  tab: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  myColor: PropTypes.string.isRequired,
  resetControlTimer: PropTypes.func.isRequired,
  updatedRoom: PropTypes.func.isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
  addToLog: PropTypes.func.isRequired,
};

export default CodePyretOrg;
