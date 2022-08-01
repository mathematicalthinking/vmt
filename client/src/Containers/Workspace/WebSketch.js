/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import testConfig from './Tools/test.json';
import WSPLoader from './Tools/WSPLoader';
import socket from '../../utils/sockets';
import API from '../../utils/apiRequests';
import mongoIdGenerator from '../../utils/createMongoId';
import ControlWarningModal from './ControlWarningModal';

import classes from './graph.css';

const WebSketch = (props) => {
  const [showControlWarning, setShowControlWarning] = useState(false);
  const [activityUpdates, setActivityUpdates] = useState();
  const [activityMessage, setActivityMessage] = useState('');

  const moveDelay = 1000 / 30; // divisor is the frame rate

  let initializing = false;
  let receivingData = false;
  let messagePending = false; // true if a message is pending but not yet sent

  let $sketch = null; // the jquery object for the server's sketch_canvas HTML element
  let sketchDoc = null; // The WSP document in which the websketch lives.
  let sketch = null; // The websketch itself, which we'll keep in sync with the server websketch.
  const wspSketch = useRef();
  const { setFirstTabLoaded } = props;

  useEffect(() => {
    initializing = true;
    // load required files and then the sketch when ready
    WSPLoader(loadSketch);
    initializing = false;
    return () => {
      socket.removeAllListeners('RECEIVE_EVENT');
      // window.UTILMENU = undefined;
      console.log('WSP activity ending - clean up listeners');
    };
  }, []);

  // Handle new Events- escapes initialization scope
  useEffect(() => {
    if (props.inControl === 'ME') {
      updateGobj(activityUpdates);
    }
  }, [activityUpdates]);

  const buildDescription = (username, updates) => {
    // TODO: build helper to parse WSP event types and event data to plain text
    let actionText = 'interacted with the Activity';
    let actionDetailText = '';
    if (updates.action === 'updateGobj') {
      actionText = 'moved a point';
    }
    if (updates.data) {
      actionDetailText = updates.data;
    }
    return `${username} ${actionText} ${actionDetailText}`;
  };

  const putState = () => {
    const { tab, temp, updateRoomTab, room } = props;
    const { _id } = tab;
    if (!sketchDoc) {
      // console.log('Setting sketc doc');
      const sketchEl = window.jQuery('#sketch');
      sketchDoc = sketchEl.data('document');
    }
    // console.log('Sketch document: ', sketchDoc);
    if (sketchDoc) {
      // grab current state-event list
      // json returned from $('#sketch').data('document').getCurrentSpecObject()
      const responseData = sketchDoc.getCurrentSpecObject();
      // console.log('Response data: ', responseData);

      // start creating a string-based object to update the tab
      const updateObject = {
        currentStateBase64: JSON.stringify(responseData),
      };
      // get and add the current screen
      // if (calculatorInst.current) {
      //   updateObject.currentScreen = getCurrentScreen();
      // }
      API.put('tabs', _id, updateObject)
        .then(() => (temp ? {} : updateRoomTab(room._id, _id, updateObject)))
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  };

  // handles a change event when user is in control
  const handleEventData = (updates, type) => {
    if (initializing) return;
    const { room, user, myColor, tab, resetControlTimer } = props;

    if (!receivingData) {
      const description = buildDescription(user.username, updates);
      const currentStateString = JSON.stringify(updates);
      const newData = {
        _id: mongoIdGenerator(),
        room: room._id,
        tab: tab._id,
        currentState: currentStateString,
        color: myColor,
        user: {
          _id: user._id,
          username: user.username,
        },
        timestamp: new Date().getTime(),
        description,
      };
      props.addToLog(newData);
      socket.emit('SEND_EVENT', newData, () => {});
      resetControlTimer();
      putState(); // save to db?
      // use new json config with $('#sketch').data('document').getCurrentSpecObject()?
    }
    receivingData = false;
  };

  const handleMessage = (msg) => {
    // msg has three properties: action, time, and data
    // for most events, data is the attributes of the WSP event
    const { data } = msg;
    switch (msg.action) {
      case 'LoadDocument':
        console.log(
          'Unimplemented: follower should load a new sketch into its sketch_canvas.'
        );
        break;
      case 'WillChangeCurrentPage':
        notify('Changed to page ' + data.newPageId, 1500);
        break;
      case 'DidChangeCurrentPage':
        sketchDoc.switchPage(data.pageId);
        sketch = sketchDoc.focusPage;
        console.log('Follower changed to page', data.pageId, 'in the sketch.');
        // setTimeout (function () {notify('');}, 1000);
        break;
      case 'updateGobj': // gobjs have moved to new locations
        updateGobjs(data);
        break;
      case 'WillPlayTool': // controlling sketch has played a tool
        notify('Playing ' + data.tool.name + ' Tool');
        break;
      case 'ToolPlayed': // controlling sketch has played a tool
        toolPlayed(data);
        notify('');
        break;
      case 'ToolAborted': // controlling sketch has aborted a tool
        notify('Canceled ' + data.tool.name + ' Tool', 1500);
        break;
      case 'WillUndoRedo': // controlling sketch will undo or redo
        notify('Performing ' + data.type, 1500);
        break;
      case 'UndoRedo': // controlling sketch has finished undo or redo
        undoRedo(data);
        break;
      default:
        // Other actions to be defined: gobjEdited, gobjStyled, etc.
        throw new Error(`Unkown message type: ${msg.action}`);
    }
  };

  // handles incoming events
  const initializeListeners = () => {
    // INITIALIZE EVENT LISTENER
    const { tab, updatedRoom, addNtfToTabs, addToLog, temp } = props;

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
        if (!temp) updatedRoom(room._id, { tabs: updatedTabs });
        const updatesState = JSON.parse(data.currentState);
        handleMessage(updatesState);
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });
  };

  const sync = (kind, constraint, handler) => {
    const sel = kind + '[constraint="' + constraint + '"]';
    const gobjs = sketch.sQuery(sel);
    gobjs.on('update', handler);
  };

  const syncGobjUpdates = () => {
    sync('Point', 'Free', updateGobj);
    sync('Point', 'PointOnPath', updateGobj);
    sync('Point', 'PointOnPolygonEdge', updateGobj);
    sync('Parameter', 'Free', updateGobj);
    // console.log('Gobj updates synchronized');
    // Should also update Calculations, and Functions (all editable expressions).
    // Also verify that PointOnPathPlotValue points work no matter what their parentage.)
  };

  const syncToFollower = () => {
    // We must be specific to avoid disconnecting other handlers for page changes, toolplay, etc.
    const handlers = [
      { event: 'WillChangeCurrentPage.WSP', handler: reflectMessage },
      { event: 'DidChangeCurrentPage.WSP', handler: reflectAndSync },
      { event: 'WillPlayTool.WSP', handler: reflectMessage },
      { event: 'ToolPlayed.WSP', handler: reflectAndSync },
      { event: 'ToolAborted.WSP', handler: reflectMessage },
      { event: 'WillUndoRedo.WSP', handler: reflectMessage },
      { event: 'UndoRedo.WSP', handler: reflectAndSync },
    ];
    handlers.forEach((el) => {
      $sketch.off(el.event, el.handler);
    });
    handlers.forEach((el) => {
      $sketch.on(el.event, el.handler);
    });
    // Required after toolplay, undo/redo, and page changes
    sketch = sketchDoc.focusPage;
    const points = sketch.sQuery('Point[constraint="Free"]');
    // console.log('Synchronizing drags');
    points.on('update', setActivityUpdates);
    syncGobjUpdates();
  };

  // If a point moved, find the object in the other sketch
  // with matching kind and label and move it to the same location.
  // Don't send the entire gobj, as it may have circular references
  // (to children that refer to their parents) and thus cannot
  // be stringifiedl.
  const updateGobj = (event) => {
    if (event) {
      const gobj = event.target;
      const gobjInfo = { id: gobj.id, constraint: gobj.constraint };
      switch (gobj.constraint) {
        case 'Free':
          if (!gobj.value) {
            gobjInfo.loc = gobj.geom.loc; // free point
          } else {
            gobjInfo.value = gobj.value; // free parameter or calculation
            // What else is needed for a free calculation?
          }
          break;
        case 'PointOnPath':
        case 'PointOnPolygonEdge':
          gobjInfo.value = gobj.value;
          break;
        default:
          console.log('updateGobj() cannot handle this event:', event);
        // Add more
      }
      sendMoveMessage(gobjInfo);
    }
  };

  const updateGobjs = (data) => {
    function setLoc(target, source) {
      target.x = source.x; // Avoid the need to create a new GSP.GeometricPoint
      target.y = source.y;
    }

    // A gobj moved, so move the same gobj in the follower sketch

    const moveList = JSON.parse(data);
    if (!sketch) {
      console.log("Messaging error: this follower's sketch is not loaded.");
      return;
    }
    // eslint-disable-next-line
    for (let id in moveList) {
      const gobjInfo = moveList[id];
      const destGobj = sketch.gobjList.gobjects[id];
      switch (gobjInfo.constraint) {
        case 'Free':
          if (gobjInfo.loc) {
            setLoc(destGobj.geom.loc, gobjInfo.loc);
          } else {
            destGobj.value = gobjInfo.value;
            // what else is needed for a free calculation?
          }
          break;
        case 'PointOnPath':
        case 'PointOnPolygonEdge':
          destGobj.value = gobjInfo.value;
          break;
        default:
          console.log(
            'follow.js does not handle constraint',
            gobjInfo.constraint
          );
      }
      destGobj.invalidateGeom();
    }
  };

  const toolPlayed = (data) => {
    // The controller has played a tool.
    // apply the delta using sQuery.applySketchDelta()
    // data also provides the timeStamp and the tool name.
    let { delta } = data;
    // console.log("A tool was played:", data.tool);
    if (typeof delta === 'string') {
      delta = JSON.parse(delta);
    }
    sketchDoc.applyDeltaToActivePage(delta);
    sketch = sketchDoc.focusPage; // Required after toolplay & undo/redo
  };

  const undoRedo = (data) => {
    // The controller has chosen Undo or Redo
    // apply the delta using sQuery.applySketchDelta()
    // data also provides the timeStamp and the tool name.
    const { delta } = data;
    // console.log('Action type:', data.type);
    if (data.type === 'undo') {
      notify('Undid previous action', 1500);
    } else {
      notify('Redid next action', 1500);
    }
    sketchDoc.applyDeltaToActivePage(delta);
    sketch = sketchDoc.focusPage;
    // Required after toolplay & undo/redo
  };

  const notify = (text, optionalDuration) => {
    // duration is unlimited if not specified
    console.log(`Notify: ${text}, duration: ${optionalDuration}`);
    // let $notifyDiv = $('#notify');
    if (text) {
      setActivityMessage(text);
      if (optionalDuration) {
        setTimeout(() => {
          console.log('Setting timeout for : ', optionalDuration);
          // only hide the notification if it's the same text as was set.
          // if (activityMessage === text) {
          setActivityMessage('');
          // }
        }, optionalDuration);
      }
    } else {
      setActivityMessage('');
    }
  };

  const sendMoveMessage = (gobjInfo) => {
    let moveMessage = {}; // assembles the next move message
    // Move messages can arrive too quickly; send them out at a reasonable frame rate
    // For a full frame interval (moveDelay), collect all move data and send out the most recent data for each affected gobj.
    moveMessage[gobjInfo.id] = gobjInfo.loc; // Add this move to the cache
    if (messagePending) return;
    // There is a follower and no message scheduled, so schedule one now
    setTimeout(() => {
      const msg = { action: 'updateGobj', time: Date.now() };
      const moveData = moveMessage; // create a ref to the current cache
      moveMessage = {}; // make a new empty cache
      messagePending = false;
      msg.data = JSON.stringify(moveData); // stringify removes GeometricPoint prototype baggage.
      console.log(
        'Sending move message: ',
        msg,
        ' to server at time',
        msg.time
      );
      // follower.postMessage(msg, '*');
      handleEventData(msg);
    }, moveDelay);
    messagePending = true;
  };

  const reflectMessage = (event, context, attr) => {
    // console.log('Send message: ', event.type);
    // sendFollowerMessage(event, attr);
    // SS: removed timeout, to make sure the follower is updated right away before any subsequent drags
    const msg = { action: event.type, time: event.timeStamp, data: attr };
    if (context !== undefined) {
      // msg.context = context;
      console.log('Message context: ', context);
    }
    handleEventData(msg);
  };

  const reflectAndSync = (event, context, attr) => {
    reflectMessage(event, context, attr);
    syncToFollower();
  };

  const loadSKetchDoc = (config) => {
    const $ = window.jQuery;
    if (!$) {
      console.warn('No jQuerious');
      return;
    }
    $('#sketch').WSP('loadSketch', {
      'data-sourceDocument': config,
      onLoad: (metadata) => {
        console.log('Loading: ', metadata);
        $sketch = $('#sketch');
        setFirstTabLoaded();
        initializeListeners();
      },
    });
    const data = $sketch.data('document');
    console.log('Found data: ', data);
    sketchDoc = data;
    sketch = data.focusPage;
  };

  const getSketchConfig = (tab) => {
    let config = tab.ggbFile
      ? JSON.parse(Buffer.from(tab.ggbFile, 'base64'))
      : testConfig;

    if (tab.currentStateBase64 && tab.currentStateBase64 !== '{}') {
      // existing event data on tab
      const { currentStateBase64 } = tab;
      config = JSON.parse(currentStateBase64);
    }
    return config;
  };

  const loadSketch = () => {
    const { tab } = props;

    let isWidgetLoaded = window.UTILMENU && !!window.UTILMENU.initUtils;
    console.log('Widgets?: ', isWidgetLoaded);
    if (isWidgetLoaded) {
      window.WIDGETS.initWidget();
      window.PAGENUM.initPageControls();
      window.UTILMENU.initUtils();

      loadSKetchDoc(getSketchConfig(tab));
      syncToFollower();
    } else {
      const pollDOM = () => {
        isWidgetLoaded = window.UTILMENU && !!window.UTILMENU.initUtils;
        console.log('Widgets recheck: ', isWidgetLoaded);
        if (isWidgetLoaded) {
          loadSKetchDoc(getSketchConfig(tab));
          syncToFollower();
        } else {
          setTimeout(pollDOM, 100); // try again in 100 milliseconds
        }
      };
      pollDOM();
    }
  };

  // interaction helpers

  function _hasControl() {
    // console.log('Control check: ', props.inControl);
    return props.inControl === 'ME';
  }

  // @TODO this could be selectively handled depending what div is clicked
  function _checkForControl(event) {
    // check if user is not in control and intercept event
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
      {activityMessage && (
        <div className={classes.Toast}>{activityMessage}</div>
      )}
      <div
        // className={classes.sketch_container}
        className="sketch_container"
        onClickCapture={_checkForControl}
        id="calculatorParent"
        // style={{
        //   height: '890px', // @TODO this needs to be adjusted based on the Player instance.
        // }}
      >
        <div
          // className={classes.Graph}
          className="sketch_canvas"
          id="sketch"
          ref={wspSketch}
          style={{
            overflow: 'auto',
            pointerEvents: !_hasControl() ? 'none' : 'auto',
          }}
        />
        <div className="buttonPane">
          <div
            className="page_buttons"
            style={{
              overflow: 'auto',
              pointerEvents: !_hasControl() ? 'none' : 'auto',
            }}
          />
        </div>
      </div>
    </Fragment>
  );
};

WebSketch.propTypes = {
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

export default WebSketch;
