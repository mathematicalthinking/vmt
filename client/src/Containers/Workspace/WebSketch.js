/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, {
  useRef,
  useState,
  useEffect,
  Fragment,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
// import throttle from 'lodash/throttle';
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
  const [activityMoves, setActivityMoves] = useState({});
  const [timeSent, setTimeSent] = useState(0);
  const [activityData, setActivityData] = useState();
  const [activityMessage, setActivityMessage] = useState('');

  const moveDelay = 175; // divisor is the frame rate

  let initializing = false;
  let receivingData = false;

  let $sketch = null; // the jquery object for the server's sketch_canvas HTML element
  let sketchDoc = null; // The WSP document in which the websketch lives.
  let sketch = null; // The websketch itself, which we'll keep in sync with the server websketch.
  const wspSketch = useRef();
  const pendingUpdate = React.createRef(null);
  let $ = window ? window.jQuery : undefined;
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
      recordGobjUpdate(activityUpdates);
    }
  }, [activityUpdates]);

  useEffect(() => {
    if (props.inControl === 'ME') {
      handleEventData(activityData);
    }
  }, [activityData]);

  // Storage API functions
  const debouncedUpdate = useCallback(debounce(putState, 250), []);

  function putState() {
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
  }

  const buildDescription = (username, updates) => {
    // TODO: build helper to parse WSP event types and event data to plain text
    let actionText = 'interacted with the Activity';
    let actionDetailText = '';
    if (!updates) {
      console.log('No updates! desc called', username, updates);
      return `${username} ${actionText} ${actionDetailText}`;
    }
    if (updates.action === 'updateGobj') {
      actionText = 'moved a point';
    }
    if (updates.data) {
      actionDetailText = updates.data;
    }
    return `${username} ${actionText} ${actionDetailText}`;
  };

  const initSketchPage = () => {
    // Refresh vars and handlers for a new sketch page
    // This needs to be called any time the sketch page is regenerated, for instance,
    // due to a page change, undo or redo, or confirmed or aborted toolplay
    // Ideally we'd like every such operation to clean up after itself by calling
    // initSketch, but the possibility of asynchronous operations suggests that
    // it may be safest to call getSketch(): a function that returns the sketch
    // object from the sketchDoc.
    if ($sketch.data('document') !== sketchDoc) {
      console.error('follow: initSketchPage found invalid sketchDoc');
      window.GSP.createError('follow: initSketchPage found invalid sketchDoc.');
    }
    sketch = sketchDoc.focusPage;
  };

  // --- Controller functions ---

  const getSketch = () => {
    // Call this whenever the sketch doc may have changed.
    // e.g., page changes, start of toolplay, undo/redo, etc.
    sketchDoc = $sketch.data('document');
    sketch = sketchDoc && sketchDoc.focusPage;
    if (!sketch) {
      console.error('getSketch() failed to find the sketch.');
    }
    return sketch;
  };

  // establish listeners
  const syncToFollower = () => {
    // We must be specific to avoid disconnecting other handlers for page changes, toolplay, etc.
    const handlers = [
      { event: 'WillChangeCurrentPage.WSP', handler: reflectMessage },
      { event: 'DidChangeCurrentPage.WSP', handler: reflectAndSync },
      { event: 'WillPlayTool.WSP', handler: reflectMessage },
      { event: 'ToolPlayed.WSP', handler: reflectAndSync },
      { event: 'ToolPlayBegan.WSP', handler: syncGobjUpdates }, // Tool objects are instantiated, so track them
      { event: 'ToolAborted.WSP', handler: reflectAndSync },
      { event: 'MergeGObjs.WSP', handler: reflectAndSync },
      { event: 'WillUndoRedo.WSP', handler: reflectMessage },
      { event: 'UndoRedo.WSP', handler: reflectAndSync },
      { event: 'ChangeStyle.WSP', handler: reflectMessage },
      { event: 'ChangeTraceStatus.WSP', handler: reflectMessage },
      { event: 'ChangeLabel.WSP', handler: reflectMessage },
      { event: 'ChangeVisibility.WSP', handler: reflectMessage },
      { event: 'DeleteGObjs.WSP', handler: reflectAndSync },
      { event: 'ClearTraces.WSP', handler: reflectMessage },
    ];
    handlers.forEach((el) => {
      $sketch.off(el.event, el.handler);
    });
    handlers.forEach((el) => {
      $sketch.on(el.event, el.handler);
    });
    // getSketch();  // Required after toolplay, undo/redo, and page changes
    // establish listeners on sketch objects, to include pointsOnPath
    syncGobjUpdates();
  };

  const syncGobjUpdates = () => {
    // We need to record updates for a limited set of objects; here's the list:
    // gobj.constraint === 'Free' (dragging can change [geom.loc] of free points, parameters, calculations, functions, pictures)
    // gobj.isFreePointOnPath     (dragging can change [geom.loc] of a point-on-path)
    // gobj.kind === 'Expression' (dragging a param, calc, or fn can change[geom.loc]; editing can change [infix])
    // gobj.kind === 'Button' (dragging can change[geom.loc]; drag-merging can change [parents])
    // gobj.kind === 'DOMKind' (dragging a table or text gobj can change [geom.loc])
    const updateSel =
      'Expression,Button,DOMKind,[constraint="Free"],[isFreePointOnPath=true]';
    let gobjsToUpdate;
    getSketch(); // Make sure we use the current sketch
    if (sketch.gobjList.gobjects === null) {
      console.log('syncGobjUpdates found no gobjs to track.');
    } else {
      gobjsToUpdate = sketch.sQuery(updateSel);
      gobjsToUpdate.on('update', setActivityUpdates);
    }
    // Handlers do not yet exist for changes to a gobj's infix or parents, and in fact
    // sQuery doesn't have an event that can be made to fire on changes to a gobj's infix or parents.
    // There is a WSP message we can listen to for parameter edits: EditParameter.WSP
    // We can listen for WSP messages when widgets are used to change a gobj's style, visibility, trace status, etc.
  };

  const reflectMessage = (event, context, attr) => {
    // SS: removed timeout, to make sure the follower is updated right away before any subsequent drags
    // const msgAttr = JSON.stringify(attr);
    const msg = { action: event.type, time: event.timeStamp, attr };
    // msg is ready to post to follower
    setActivityData(msg);
  };

  // send msg and then reestablish listeners, could possibly be done for all events
  const reflectAndSync = (event, context, attr) => {
    reflectMessage(event, context, attr);
    // getSketch();
    sketch = sketchDoc.focusPage;
    syncToFollower();
  };

  /* If a free or semi-free gobj is updated, find the gobj in the other sketch
   with matching kind and label and move it to the same location.
   We only need to handle certain constraints and kinds:
   Free constraints may have changed values or locations.
   Semi-free constraints (isFreePointOnPath) may have changed values.
   Expressions may have been edited.
   Don't send the entire gobj, as it may have circular references
   (to children that refer to their parents) and thus cannot
   be stringifiedl. */
  const recordGobjUpdate = (event) => {
    if (event) {
      const gobj = event.target;
      if (
        gobj.constraint !== 'Free' &&
        gobj.kind !== 'Expression' &&
        !gobj.isFreePointOnPath
      ) {
        return;
      }
      const gobjInfo = { id: gobj.id, constraint: gobj.constraint };
      switch (gobj.constraint) {
        case 'Free': // Free points have locations
        case 'Calculation':
          if (gobj.value) {
            // free expressions (params and calcs) have values
            gobjInfo.value = gobj.value; // free parameter or calculation
          }
          if (gobj.geom.loc) {
            // free points, params, etc. have locations
            gobjInfo.loc = gobj.geom.loc;
          }
          break;
        case 'PointOnPath':
        case 'PointOnPolygonEdge':
          gobjInfo.value = gobj.value;
          break;
        default:
          console.log('recordGobjUpdate() cannot handle this event:', event);
        // Add more
      }
      // sendUpdateMessage(gobjInfo);
      const { id } = gobjInfo;
      setActivityMoves((prevMoves) => ({ ...prevMoves, [id]: gobjInfo }));
    }
  };

  useEffect(() => {
    if (Object.keys(activityMoves).length !== 0) {
      const now = Date.now();
      const timeSince = now - timeSent;
      if (timeSince >= moveDelay) {
        console.log('Posting moves, delay: ', timeSince);
        postMoveMessage();
      } else {
        // sweep messages that may have been missed
        pendingUpdate.current = setTimeout(
          () => postMoveMessage(),
          moveDelay - timeSince
        );
      }
    }
    return () => {
      clearTimeout(pendingUpdate.current);
    };
  }, [activityMoves]);

  function postMoveMessage() {
    const msg = { action: 'GobjsUpdated', time: Date.now() };
    const moveData = { ...activityMoves }; // create a ref to the current cache
    console.log('Move dat: ', moveData);
    setActivityMoves({});
    if (Object.keys(moveData).length !== 0) {
      setTimeSent(Date.now());
      msg.attr = JSON.stringify(moveData); // stringify removes GeometricPoint prototype baggage.
      // msg ready to post to follower
      handleEventData(msg);
    }
  }

  // sends an update msg object for the user in control
  const handleEventData = (updates, type) => {
    if (initializing) return;
    const { room, user, myColor, tab, resetControlTimer } = props;
    if (!receivingData) {
      const description = buildDescription(user.username, updates);
      console.log('Sent message: ', updates);

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
      // putState(); // save to db?
      debouncedUpdate();
      // use new json config with $('#sketch').data('document').getCurrentSpecObject()?
    }
    receivingData = false;
  };

  // --- Follower Functions ---
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
        console.log('Handling incoming msg: ', updatesState);

        handleMessage(updatesState);
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });
  };

  const gobjDesc = (gobj, cur, max) => {
    // Returns a gobj-description string suitable for a list of form
    // "Point #1, Point B, Circle #4, ..."
    // cur is the 0-based item number in the list, max is the max allowed
    // So with max = 3 the return values for cur = 1, 2,etc. are
    // cur = 0: "Point #1"
    // cur = 1: ", Point B"
    // cur = 2: ", Circle #4"
    // cur = 3: ", ..."
    // cur > 3: ""
    var retVal = '';
    if (cur === max) {
      retVal = ', ...';
    } else if (cur < max) {
      retVal = gobj.kind + ' ' + (gobj.label ? gobj.label : '#' + gobj.id);
      if (cur > 0) {
        retVal = ', ' + retVal;
      }
    }
    return retVal;
  };

  const handleMessage = (msg) => {
    // msg has three properties: action, time, and data
    // for most events, data is the attributes of the WSP event
    const { attr } = msg;
    const mergeGobjDesc = (gobjInfo, toInfo) => {
      // given a merged gobj and info about what it was merged to
      const gobjs = sketch.gobjList.gobjects;
      let desc = ' ' + gobjDesc(gobjInfo) + ' ';
      // The merged gobj may have gone away, but gobjInfo recorded the kind, label, and id
      const gobj2 = gobjs[toInfo.id1];
      const desc2 = ' ' + gobjDesc(gobj2);
      let gobj3;
      let desc3;
      if (toInfo.type !== 'intersection') {
        desc += 'to' + desc2;
      } else {
        gobj3 = gobjs[toInfo.id2];
        desc3 = gobjDesc(gobj3);
        desc += 'to the intersection of ' + desc2 + ' and ' + desc3;
      }
      return desc;
    };

    switch (msg.action) {
      case 'LoadDocument':
        console.log(
          'Unimplemented: follower should load a new sketch into its sketch_canvas.'
        );
        break;
      case 'WillChangeCurrentPage':
        notify('Changed to page ' + attr.newPageId, { duration: 1500 });
        break;
      case 'DidChangeCurrentPage':
        sketchDoc.switchPage(attr.pageId);
        getSketch();
        console.log('Follower changed to page', attr.pageId, 'in the sketch.');
        // setTimeout (function () {notify('');}, 1000);
        break;
      case 'GobjsUpdated': // gobjs have moved to new locations
        imposeGobjUpdates(attr);
        break;
      case 'ToolPlayBegan':
      case 'WillPlayTool': // controlling sketch will play a tool
        notify('Playing ' + attr.tool.name + ' Tool');
        startFollowerTool(attr.tool.name);
        break;
      // Ignore ToolPlayBegan, as we simulate only user drags (not matches) during toolplay
      // To get all the internals right, we'd need to duplicate every snap and unsnap.
      // We still may need to keep a record of snapped gobjs to get the drags right.
      case 'ToolPlayed': // controlling sketch has played a tool
        toolPlayed(attr);
        notify('');
        break;
      case 'ToolAborted': // controlling sketch has aborted a tool
        notify('Canceled ' + attr.tool.name + ' Tool');
        abortFollowerTool();
        break;
      case 'MergeGObjs': // controlling sketch has played a tool
        gobjsMerged(attr);
        notify('Merged' + mergeGobjDesc(attr.merged, attr.result));
        // attr.merged and attr.result have id and label properties
        break;
      case 'WillUndoRedo': // controlling sketch will undo or redo
        notify('Performing ' + attr.type);
        break;
      case 'UndoRedo':
        undoRedo(attr);
        break;
      case 'ChangeStyle':
        changeStyle(attr);
        break;
      case 'ChangeTraceStatus':
        changeTraceStatus(attr);
        break;
      case 'ClearTraces':
        notify('Traces cleared.');
        sketch.clearTraces();
        break;
      case 'ChangeLabel':
        changeLabel(attr);
        break;
      case 'ChangeVisibility':
        changeVisibility(attr);
        break;
      case 'DeleteGObjs':
        deleteGobjs(attr);
        break;
      default:
        // Other actions to be defined: gobjEdited, gobjStyled, etc.
        throw new Error(`Unkown message type: ${msg.action}`);
    }
  };

  const notify = (text, options) => {
    const { GSP } = window;
    // duration is 2000 if not specified
    let duration = 2000;
    let gobjs;
    let callback;
    if (options && GSP) {
      duration = GSP._get(options, 'duration') || 2500;
      gobjs = GSP._get(options, 'highlitGobjs'); //
      callback = GSP._get(options, 'callback');
    }

    const highlight = (on) => {
      if (!gobjs) return;
      $.each(gobjs, () => {
        // this may be a gobj, or may be a gobj id
        const gobj =
          typeof this === 'string' ? sketch.gobjList.gobjects[this] : this;
        const { state } = gobj;
        if (on) {
          if (state.renderState) {
            state.oldRenderState = state.renderState; // track the previous renderState
          }
          state.renderState = 'targetHighlit';
        } else {
          // off
          if (state.renderState === 'targetHighlit') {
            if (state.oldRenderState) {
              // prev renderState existed, so restore it
              state.renderState = state.oldRenderState;
            } else {
              // prev renderState didn't exist, so restore its non-existence
              delete state.renderState;
            }
          }
          delete state.oldRenderState; // delete tracked prev value, if any
        }
        gobj.invalidateAppearance();
      });
    };
    // console.log(`Notify: ${text}, duration: ${duration}`);
    // let $notifyDiv = $('#notify');
    if (text) {
      setActivityMessage(text);
      highlight(true);
      setTimeout(() => {
        // only hide the notification if it's the same text as was set.
        setActivityMessage('');
        highlight(false);
        if (callback) {
          callback();
        }
      }, duration);
    } else {
      setActivityMessage('');
    }
  };

  const imposeGobjUpdates = (data) => {
    function setLoc(target, source) {
      target.x = source.x; // Avoid the need to create a new GSP.GeometricPoint
      target.y = source.y;
    }
    // A gobj moved, so move the same gobj in the follower sketch
    let moveList = JSON.parse(data);
    initSketchPage();
    if (!sketch) {
      console.log("Messaging error: this follower's sketch is not loaded.");
      return;
    }
    console.log('Handling Gobjs: ', moveList);

    // eslint-disable-next-line
    for (let id in moveList) {
      const gobjInfo = moveList[id];
      const destGobj = sketch.gobjList.gobjects[id];
      if (!destGobj) {
        console.log('No destination Gobj found to handle the move data!');
        continue; // The moveList might be out of date during toolplay,
        // and could include a gobj that no longer exists.
      }
      switch (gobjInfo.constraint) {
        case 'Calculation':
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
            'follower does not handle constraint',
            gobjInfo.constraint
          );
      }
      destGobj.invalidateGeom();
    }
  };

  const startFollowerTool = (name) => {
    let tool;
    if (
      sketchDoc.tools.some((aTool) => {
        if (aTool.metadata.name === name) {
          tool = aTool;
          return true;
        }
        return false;
      })
    ) {
      sketch.toolController.setActiveTool(tool);
    }
  };

  const abortFollowerTool = () => {
    // What is no tool is active?
    sketch.toolController.abortActiveTool();
  };

  const toolPlayed = (data) => {
    // The controller has played a tool, and the follower has shown the process by imposing tool-object updates,
    // not by simulating mouse events. This leaves the controller and follower sketches in different states.
    // NB: This implies that we cannot allow the controller and follower to switch control during toolplay.
    // It also complicates the result, because we need to sync the undo history, not just sketch state.
    // So we confirm the tool and then insert the controller's tool delta in place of the follower's.
    // If data contains a preDelta, ignore it as it should be in our current history as well.
    // console.log('Tool played: ', data);
    if (!sketch || !sketchDoc) {
      console.log('NO Sketch to play tool on! ', sketch);
    }
    const controller = sketch.toolController;
    const history = sketchDoc.getCurrentPageData().session.history;
    controller.confirmActiveTool(); // Uses the follower delta instead of the passed delta
    sketchDoc.undo();
    history.current.next.delta = data.delta;
    sketchDoc.redo();
    // Required after toolplay & undo/redo
    getSketch();
  };

  const gobjsMerged = (data) => {
    // Similarly to toolPlayed(), some gobjs have been merged and gone away.
    // But the follower has nothing to undo, so just needs to redo the passed delta.
    // (This will lose any remaining redo deltas, thus matching up with the controller.)
    // If data contains a preDelta, figure out what to do.
    const history = sketchDoc.getCurrentPageData().session.history;
    let current = history.current;
    if (data.preDelta) {
      current.next = { delta: data.preDelta, prev: current, next: null };
      history.redo();
      current = history.current; // history.redo() changes current.
    }
    current.next = { delta: data.delta, prev: current, next: null };
    sketchDoc.redo();
    getSketch(); // Required after changes in the sketch graph (toolplay, undo/redo, merge)
  };

  const undoRedo = (data) => {
    // The controller has chosen Undo or Redo. Do the same for the follower,
    // but also check to make sure the controller and follower histories are in sync.
    if (data.type === 'undo') {
      // notify('Undid previous action', 1500);
      sketchDoc.undo();
    } else {
      // notify('Redid next action', 1500);
      sketchDoc.redo();
    }
    // Required after toolplay & undo/redo
    getSketch();
    // FOR DEBUGGING: Check whether the controller and follower undo histories are in sync!
    let history = sketchDoc.getCurrentPageData().session.history;
    if (
      JSON.stringify(data.delta) !==
      JSON.stringify(
        sketchDoc.getCurrentPageData().session.history.current.delta
      )
    ) {
      console.log('UNDO HISTORIES DIVERGE!!');
      console.log('controller delta:', data.delta);
      console.log('follower delta:', history.current.delta);
    }
  };

  const changeStyle = (attr) => {
    function multipleGobjs() {
      let note;
      let gobjCount = 0;
      const maxCount = 4;
      note = attr.canceling
        ? 'Canceled style changes for '
        : 'Changed styles for ';
      // eslint-disable-next-line
      $.each(attr.changes, function(id) {
        const gobj = sketch.gobjList.gobjects[id];
        gobj.style = JSON.parse(this.style);
        gobj.invalidateAppearance();
        note += gobjDesc(gobj, gobjCount, maxCount);
        gobjCount += 1;
      });
      notify(note, { duration: 3000, highlitGobjs: Object.keys(attr.changes) });
    }

    function singleGobj() {
      const gobj = sketch.gobjList.gobjects[attr.id];
      const note = 'Changed style for ' + gobjDesc(gobj, 0, 1);
      gobj.style = attr.newStyle;
      notify(note, { duration: 2000, highlitGobjs: [attr.id] });
    }

    if (attr.changes) {
      multipleGobjs();
    } else {
      singleGobj();
    }
  };

  function changeTraceStatus(attr) {
    const gobj = sketch.gobjList.gobjects[attr.id];
    const newState = attr.tracing;
    const note =
      'Tracing turned ' +
      (newState ? 'on' : 'off') +
      ' for ' +
      gobjDesc(gobj, 0, 1);
    notify(note, { duration: 2000, highlitGobjs: [attr.id] });
    gobj.style.traced = newState;
  }

  function changeLabel(attr) {
    // attr: id and label are always present
    // style and autoGenerate are present if changed
    const gobj = sketch.gobjList.gobjects[attr.id];
    const labelChanged = attr.label !== 'gobj.label';
    let note = 'Changed ' + (labelChanged ? 'label ' : '');
    if (attr.style) {
      note += (labelChanged ? 'and ' : '') + 'label style ';
      gobj.style = attr.style;
    }
    if (labelChanged) {
      gobj.label = attr.label;
    }
    note += 'of ' + gobjDesc(gobj, 0, 1);
    notify(note, { duration: 2000, highlitGobjs: [attr.id] });
    if (attr.autoGenerateLabel) {
      gobj.autoGenerateLabel = attr.autoGenerateLabel;
    }
    gobj.invalidateAppearance();
  }

  function changeVisibility(data) {
    let noteHidden = 'Hiding ';
    let noteShown = 'Showing ';
    let note = '';
    let hidCount = 0;
    let showCount = 0;
    const maxCount = 4;
    // eslint-disable-next-line
    $.each(data.changes, function(id) {
      const gobj = sketch.gobjList.gobjects[id];
      gobj.style.hidden = this.hidden;
      if (this.hidden) {
        noteHidden += gobjDesc(gobj, hidCount, maxCount);
        hidCount += 1;
      } else {
        noteShown += gobjDesc(gobj, showCount, maxCount);
        showCount += 1;
      }
      gobj.invalidateAppearance();
    });
    if (hidCount) note += noteHidden;
    if (hidCount && showCount) note += ' and ';
    if (showCount) note += noteShown;
    notify(note, { duration: 3000, highlitGobjs: data.changes });
    // Ideally the notify timeout would fade the changed objects in and out while the notice is up
    // We could provide a callback that would send a parameter that runs from 0 to 100 during the timeout
    // For the time being, we could show the hidden objects, trigger the notification, and then
    // hid the visible objects.
  }

  function deleteGobjs(data) {
    let note = 'Deleted ';
    const deletedGobjs = {};
    let thisDelta;
    let gobjCount = 0;
    const maxCount = 6;

    function doDelete() {
      sketch.gobjList.removeGObjects(deletedGobjs, sketch);
      thisDelta = sketch.document.pushConfirmedSketchOpDelta(data.preDelta);
      // CHECK: thisDelta should match data.delta.
      console.log('Delete delta: ', thisDelta, ' vs ', data.delta);
      sketch.document.changedUIMode();
    }

    $.each(data.deletedIds, function() {
      const gobj = sketch.gobjList.gobjects[this];
      deletedGobjs[this] = gobj;
      note += gobjDesc(gobj, gobjCount, maxCount);
      gobjCount += 1;
    });

    notify(note, {
      duration: 3000,
      highlitGobjs: data.deletedIds,
      callback: doDelete,
    });
  }

  // --- Initialization functions ---

  const loadSketchDoc = (config) => {
    $ = window.jQuery;
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
    const sketchWidth = data.metadata.width;
    console.log('Sketch width: ', sketchWidth);
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

    // When should this call happen, before or after loading the sketch?
    let isWidgetLoaded = window.UTILMENU && !!window.UTILMENU.initUtils;
    console.log('Widgets?: ', isWidgetLoaded);
    if (isWidgetLoaded) {
      window.WIDGETS.initWidget();
      window.PAGENUM.initPageControls();
      window.UTILMENU.initUtils();
      loadSketchDoc(getSketchConfig(tab));
      // establish sketch listeners for handlers
      syncToFollower();
    } else {
      const pollDOM = () => {
        isWidgetLoaded = window.UTILMENU && !!window.UTILMENU.initUtils;
        console.log('Widgets recheck: ', isWidgetLoaded);
        if (isWidgetLoaded) {
          loadSketchDoc(getSketchConfig(tab));
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
