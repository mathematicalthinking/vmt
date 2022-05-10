import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import testConfig from './Tools/test.json';
import WSPLoader from './Tools/WSPLoader';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import ControlWarningModal from './ControlWarningModal';

import classes from './graph.css';

const WebSketch = (props) => {
  const [showControlWarning, setShowControlWarning] = useState(false);
  const [activityUpdates, setActivityUpdates] = useState();

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
      console.log('WSP activity ending - clean up listeners');
    };
  }, []);

  // Handle new Events
  useEffect(() => {
    if (props.inControl === 'ME') {
      moveGobj(activityUpdates);
    }
  }, [activityUpdates]);

  const buildDescription = (username, updates) => {
    // TODO: build helper to parse WSP event types and event data to plain text
    let actionText = 'interacted with the Activity';
    let actionDetailText = '';
    if (updates.action === 'moveGobj') {
      actionText = 'moved a point';
    }
    if (updates.data) {
      actionDetailText = updates.data;
    }
    return `${username} ${actionText} ${actionDetailText}`;
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
      console.log('Data to send: ', newData);
      props.addToLog(newData);
      socket.emit('SEND_EVENT', newData, () => {});
      resetControlTimer();
      // putState();  // save to db?
    }
    receivingData = false;
  };

  function handleMessage(msg) {
    // msg has three properties: action, time, and data
    // for most events, data is the attributes of the WSP event
    let data = msg.data;
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
        // initSketchPage();
        sketch = sketchDoc.focusPage;
        console.log('Follower changed to page', data.pageId, 'in the sketch.');
        // setTimeout (function () {notify('');}, 1000);
        break;
      case 'moveGobj': // gobjs have moved to new locations
        moveGobjs(data);
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
  }

  // handles incoming events
  function initializeListeners() {
    // INITIALIZE EVENT LISTENER
    const { tab, updatedRoom, addNtfToTabs, addToLog, temp } = props;

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
        if (!temp) updatedRoom(room._id, { tabs: updatedTabs });
        // updatedRoom(room._id, { tabs: updatedTabs });
        const updatesState = JSON.parse(data.currentState);
        // moveGobj(updatesState);
        handleMessage(updatesState);
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });
  }

  const updateHandler = (attr) => {
    setActivityUpdates(attr);
  };

  // sketch event helpers
  // function moveGobj(attr) {
  //   // A point moved: Find the object in the other sketch with the same id, and move it
  //   // to the same location. Don't send the entire gobj, as it may have circular references
  //   // (to children that refer to their parents) and thus cannot be stringified.

  //   if (_hasControl()) {
  //     const gobj = attr.target;
  //     const gobjInfo = { id: gobj.id, loc: gobj.geom.loc };
  //     const gobjData = JSON.stringify(gobjInfo, null, 2);
  //     // console.log({
  //     //   action: "moveGobj",
  //     //   data: gobjData,
  //     // });
  //     sendMoveMessage(gobjInfo);
  //     // handleEventData(gobjInfo);
  //   } else {
  //     let selector = `#${attr.id}`;
  //     // console.log("Selector: ", selector, " sQuery? ", !!sketch.sQuery);
  //     let destGobj = sketch.sQuery(selector)[0];
  //     destGobj.geom.loc = GSP.GeometricPoint(attr.loc);
  //     destGobj.invalidateGeom();
  //   }
  // }

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
    handlers.forEach(function(el) {
      $sketch.off(el.event, el.handler);
    });
    handlers.forEach(function(el) {
      $sketch.on(el.event, el.handler);
    });
    // initSketchPage(); // Required after toolplay, undo/redo, and page changes
    sketch = sketchDoc.focusPage;
    let points = sketch.sQuery('Point[constraint="Free"]');
    console.log('Synchronizing drags');
    points.on('update', moveGobj);
  };

  // If a point moved, find the object in the other sketch
  // with matching kind and label and move it to the same location.
  // Don't send the entire gobj, as it may have circular references
  // (to children that refer to their parents) and thus cannot
  // be stringifiedl.
  function moveGobj(event) {
    // if (props.inControl) {
    let gobj = event.target;
    let gobjInfoDat = { id: gobj.id, loc: gobj.geom.loc };
    sendMoveMessage(gobjInfoDat);
    // } else {
    //   let selector = `#${attr.id}`;
    //   // console.log("Selector: ", selector, " sQuery? ", !!sketch.sQuery);
    //   let destGobj = sketch.sQuery(selector)[0];
    //   destGobj.geom.loc = GSP.GeometricPoint(attr.loc);
    //   destGobj.invalidateGeom();
    // }
  }

  function moveGobjs(data) {
    // A gobj moved, so move the same gobj in the follower sketch
    let moveList = JSON.parse(data);
    if (!sketch) {
      console.log("Messaging error: this follower's sketch is not loaded.");
      return;
    }
    for (let id in moveList) {
      let newLoc = moveList[id];
      let destGobj = sketch.gobjList.gobjects[id];
      let loc = destGobj.geom.loc;
      loc.x = newLoc.x; // Avoid the need to create a new GSP.GeometricPoint
      loc.y = newLoc.y;
      destGobj.invalidateGeom();
    }
  }

  function toolPlayed(data) {
    // The controller has played a tool.
    // apply the delta using sQuery.applySketchDelta()
    // data also provides the timeStamp and the tool name.
    let delta = data.delta;
    // console.log("A tool was played:", data.tool);
    if (typeof delta === 'string') {
      delta = JSON.parse(delta);
    }
    sketchDoc.applyDeltaToActivePage(delta);
    initSketchPage(); // Required after toolplay & undo/redo
  }

  function undoRedo(data) {
    // The controller has chosen Undo or Redo
    // apply the delta using sQuery.applySketchDelta()
    // data also provides the timeStamp and the tool name.
    let delta = data.delta;
    console.log('Action type:', data.type);
    if (data.type === 'undo') {
      notify('Undid previous action', 1500);
    } else {
      notify('Redid next action', 1500);
    }
    sketchDoc.applyDeltaToActivePage(delta);
    initSketchPage(); // Required after toolplay & undo/redo
  }

  function notify(text, optionalDuration) {
    // duration is unlimited if not specified
    console.log(`Notify: ${text}, duration: ${optionalDuration}`);
    // let $notifyDiv = $('#notify');
    // if (text) {
    //   $notifyDiv[0].innerText = text;
    //   $notifyDiv.show();
    //   if (optionalDuration) {
    //     setTimeout (
    //       function () { // only hide the notification if it's the same text as was set.
    //         if ($notifyDiv[0].innerText === text) {
    //           notify('');
    //         }
    //       },
    //       optionalDuration
    //     );
    //   }
    // } else {
    //   $notifyDiv.hide();
    //   $notifyDiv[0].innerText = '';
    // }
  }

  function sendMoveMessage(gobjInfo) {
    let moveMessage = {}; // assembles the next move message

    // Move messages can arrive too quickly; send them out at a reasonable frame rate
    // For a full frame interval (moveDelay), collect all move data and send out the most recent data for each affected gobj.
    moveMessage[gobjInfo.id] = gobjInfo.loc; // Add this move to the cache
    if (messagePending) return;
    // There is a follower and no message scheduled, so schedule one now
    setTimeout(function() {
      let msg = { action: 'moveGobj', time: Date.now() };
      let moveData = moveMessage; // create a ref to the current cache
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
  }

  function reflectMessage(event, context, attr) {
    console.log('Send message: ', event.type);
    // sendFollowerMessage(event, attr);
  }

  function reflectAndSync(event, context, attr) {
    reflectMessage(event, context, attr);
    syncToFollower();
  }

  const loadSketch = () => {
    const { tab } = props;
    const config = tab.ggbFile
      ? JSON.parse(Buffer.from(tab.ggbFile, 'base64'))
      : testConfig;
    const $ = window.jQuery;
    if (!$) {
      console.warn('No jQuerious');
      return;
    }
    $('#sketch').WSP('loadSketch', {
      'data-sourceDocument': config,
      onLoad: function(metadata) {
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
    syncToFollower();

    // let points = sketch.sQuery('Point[constraint="Free"]');
    // points.on('update', updateHandler);
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
          id="sketch"
          ref={wspSketch}
          style={{
            overflow: 'auto',
            pointerEvents: !_hasControl() ? 'none' : 'auto',
          }}
        />
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
