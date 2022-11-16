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
import ControlWarningModal from './ControlWarningModal';

import classes from './graph.css';

const WebSketch = (props) => {
  const [showControlWarning, setShowControlWarning] = useState(false);
  const [activityUpdates, setActivityUpdates] = useState();
  const [activityMoves, setActivityMoves] = useState({});
  const [timeSent, setTimeSent] = useState(0);
  const [activityData, setActivityData] = useState();
  const [activityMessage, setActivityMessage] = useState('');
  const [persistMessage, setPrependMessage] = useState('');
  const [highLights, setHighLights] = useState([]); // Array of highlighted gobjs that must be turned off when new gobjs are highlighted
  // Note that highLights represents a state that needs to persist over handleMessage calls.

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
      // do we need to unmount or destroy the wsp instance?
      console.log('WSP activity ending - clean up listeners');
    };
  }, []);

  useEffect(() => {
    setPrependMessage('');
    setActivityMessage('');
    if (window.jQuery) {
      if (!sketchDoc) {
        // console.log('Setting sketc doc');
        const sketchEl = window.jQuery('#sketch');
        sketchDoc = sketchEl.data('document');
      }
      if (sketchDoc) {
        if (!_hasControl()) {
          sketchDoc.isRemote = true;
          // Set this flag to prevent activating a numpad/calculator UI at the end of toolplay.
          // "isRemote" indicates that this sketchDoc is controlled remotely, not by the containing page.
        } else {
          sketchDoc.isRemote = false;
        }
        sketch = sketchDoc.focusPage;
        if (!$) {
          console.warn('$ not set for jQuery!');
          $ = window.jQuery;
        }
        const $numPadCancel = $('.wsp-Numberpad-cancel:visible');
        const $calcButtons = $(
          'button.wsp-Calculator-textual.wsp-Calculator-bottom-button:visible'
        );
        if (sketch.toolController.activeRegime) {
          sketch.toolController.abortActiveTool();
        }
        window.WIDGETS.cancelModality();
        const buttons = sketch.sQuery('Button');
        buttons.forEach((button) => {
          if (button.state.isActive) {
            button.press(sketch);
          }
        });
        if ($numPadCancel.length) {
          $numPadCancel.click();
        }

        if ($calcButtons.length) {
          $.each($calcButtons, function() {
            if (this.innerText === 'Cancel') {
              $(this).click();
            }
          });
        }
      }
    }
  }, [props.inControl]);

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
    // TODO: build helper to parse WSP event types and event data to plain text - parseWSPevent in draft
    let actionText = parseWSPevent(updates) || 'interacted with the sketch';
    let actionDetailText = '';
    if (!updates) {
      console.log('No updates! desc called', username, updates);
      return `${username} ${actionText} ${actionDetailText}`;
    }
    return `${username} ${actionText} ${actionDetailText}`;
  };

  const parseWSPevent = (msg) => {
    if (!msg) return;
    let { attr } = msg;
    let gobj;
    if (typeof attr === 'string') {
      attr = JSON.parse(attr);
    }
    if (attr.gobjId) {
      if (!sketch) {
        getSketch();
      }
      if (sketch) {
        gobj = sketch.gobjList.gobjects[attr.gobjId];
      }
    } else {
      gobj = Object.keys(attr)[0];
    }
    switch (msg.name) {
      case 'WillChangeCurrentPage':
        return `changed to page ${attr.pageId}`;
      case 'DidChangeCurrentPage':
        return `changed to page ${attr.pageId}`;
      case 'GobjsUpdated': // gobjs have moved to new locations
      case 'StartDragConfirmed': // highlight the dragged gobj
        return `dragged ${gobjDesc(gobj)}`;
      case 'EndDrag': // the drag ended
        return `stopped dragging ${gobjDesc(gobj)}`;
      case 'WillPlayTool': // controlling sketch will play a tool
        return `started using ${attr.tool.name} tool`;
      case 'ToolPlayed': // controlling sketch has played a tool
        return `used ${attr.tool.name} tool`;
      case 'ToolAborted': // controlling sketch has aborted a tool
        return `stopped using ${attr.tool.name} tool`;
      case 'MergeGobjs': // controlling sketch has merged a gobj
        return `Merged gobj ${mergeGobjDesc(attr)}`;
      case 'WillUndoRedo': // controlling sketch will undo or redo
        return `Performing ${attr.type}`;
      case 'StartEditParameter': // These messages notify the user; an update message actually performs the update
        return 'initiated a parameter edit';
      case 'CancelEditParameter': // These messages notify the user; an update message actually performs the update
        return 'cancelled a parameter edit';
      case 'EditParameter':
        return 'edited a parameter';
      case 'ClearTraces':
        return 'cleared traces';
      case 'UndoRedo':
        return `performed ${
          attr.type == 'undo' ? 'an undo' : `a ${attr.type}`
        } action`;
      case 'PressButton':
        return `pressed ${gobjDesc(gobj)}`;
      case 'EditExpression':
        return `${attr.action} editing ${gobjDesc(gobj)}`;
      case 'StyleWidget':
        return `${
          attr.action != 'changed' ? attr.action : 'change'
        }d the style widget`;
      case 'TraceWidget':
        return `${
          attr.action != 'glowing' ? attr.action : 'activate'
        }d the trace widget`;
      case 'LabelWidget':
        return `${
          attr.action != 'finalized' ? attr.action : 'finalize'
        }d the label widget`;
      case 'VisibilityWidget':
        return `${
          attr.action != 'changed' ? attr.action : 'change'
        }d the visibility widget`;
      case 'DeleteWidget':
        return `${
          attr.action != 'deleteConfirm' ? attr.action : 'delete confirme'
        }d the delete widget`;
      case 'PrefChanged':
      default:
        console.warn('Unimplemented action! ', msg, attr);
        return 'interacted with the sketch';
    }
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
    if (!$sketch) {
      $sketch = $('#sketch');
    }
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
      { event: 'StartDragConfirmed.WSP', handler: reflectMessage },
      { event: 'EndDrag.WSP', handler: reflectMessage },
      { event: 'EndLabelDrag.WSP', handler: reflectMessage },
      { event: 'WillPlayTool.WSP', handler: reflectMessage },
      { event: 'ToolPlayed.WSP', handler: reflectAndSync },
      { event: 'ToolPlayBegan.WSP', handler: syncGobjUpdates }, // Tool objects are instantiated, so track them
      { event: 'ToolAborted.WSP', handler: reflectAndSync },
      { event: 'MergeGobjs.WSP', handler: reflectAndSync },
      { event: 'WillUndoRedo.WSP', handler: reflectMessage },
      { event: 'UndoRedo.WSP', handler: reflectAndSync },
      { event: 'StyleWidget.WSP', handler: reflectMessage },
      { event: 'TraceWidget.WSP', handler: reflectMessage },
      { event: 'LabelWidget.WSP', handler: reflectMessage },
      { event: 'VisibilityWidget.WSP', handler: reflectMessage },
      { event: 'DeleteWidget.WSP', handler: reflectAndSync },
      // We now use a single EditExpression message type for editing param, calc, and function gobjs
      { event: 'EditExpression.WSP', handler: reflectMessage },
      { event: 'ClearTraces.WSP', handler: reflectMessage },
      { event: 'PrefChanged.WSP', handler: reflectMessage },
      { event: 'PressButton.WSP', handler: reflectMessage },
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
  };

  const reflectMessage = (event, context, attr) => {
    // SS: removed timeout, to make sure the follower is updated right away before any subsequent drags
    // const msgAttr = JSON.stringify(attr);
    let sender;
    let canvasNode;
    if (context && context.document) {
      canvasNode = context.document.canvasNode[0];
      sender = { id: canvasNode.id, baseURI: canvasNode.baseURI };
    }
    const msg = {
      name: event.type,
      time: event.timeStamp,
      sender,
      attr,
    };
    // msg is ready to post to follower
    setActivityData(msg);
  };

  // send msg and then reestablish listeners, could possibly be done for all events
  const reflectAndSync = (event, context, attr) => {
    reflectMessage(event, context, attr);
    getSketch();
    // sketch = sketchDoc.focusPage;
    syncToFollower();
  };

  /* If a free or semi-free gobj is updated, find the gobj in the other sketch
   with matching kind and label and move it to the same location.
   We only need to handle certain constraints and kinds:
   Free constraints may have changed values or locations.
   Semi-free constraints (isFreePointOnPath) may have changed values.
   Expressions may have been edited.
   Buttons may have been dragged
   Don't send the entire gobj, as it may have circular references
   (to children that refer to their parents) and thus cannot
   be stringifiedl. */
  const recordGobjUpdate = (event) => {
    if (event) {
      const gobj = event.target;
      let selector = gobj.constraint;
      if (
        gobj.constraint !== 'Free' &&
        gobj.kind !== 'Expression' &&
        gobj.kind !== 'Button' &&
        !gobj.isFreePointOnPath
      ) {
        return;
      }
      const gobjInfo = { id: gobj.id, constraint: gobj.constraint };
      if (gobj.kind === 'Button') {
        selector = 'Button';
      }
      switch (selector) {
        case 'Free': // Free points have locations; free parameters have values and locations
          if (gobj.geom.loc) {
            // free points, params, etc. have locations
            gobjInfo.loc = gobj.geom.loc;
          }
          if (window.GSP.isParameter(gobj)) {
            // can we distinguish an edited param from a dragged param?
            gobjInfo.expression = gobj.expression;
          } else {
            break; // Params should fall through; free points should not
          }
        /* falls through */
        case 'Calculation':
        case 'Function':
        case 'Button':
          // All of these objects have locations, and all can be edited; dragging and editing both generate updates
          if (gobj.geom.loc) {
            // All have locations; update if needed.
            gobjInfo.loc = gobj.geom.loc;
          }
          if (gobj.value) {
            // free expressions (params and calcs) have values
            gobjInfo.value = gobj.value; // free parameter or calculation
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
      // Don't bother with context; it has cycles and cannot easily be stringified -- (?: ANZ) Do we need context here?
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
    const msg = { name: 'GobjsUpdated', time: Date.now() };
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
    const { user, emitEvent } = props;
    if (!receivingData) {
      const description = buildDescription(user.username, updates);
      console.log('Sent message: ', updates);

      const currentStateString = JSON.stringify(updates);
      const newData = {
        currentState: currentStateString,
        description,
      };
      emitEvent(newData);
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

    if (typeof gobj === 'string') {
      if (!sketch) {
        getSketch();
      }
      gobj = sketch && sketch.gobjList && sketch.gobjList.gobjects[gobj];
      // if (!(gobj && gobj.id && gobj.kind))
      //   console.error('follow.gobjDesc() gobj param is neither string nor id.');
    }
    let retVal = '';
    let title = '';
    if (!gobj) {
      console.error('No gobj defined for desc!');
    } else {
      title = gobj.kind;
    }
    if (typeof cur === 'undefined') {
      cur = 0;
      max = 1;
    }
    if (cur === max) {
      retVal = ', ...';
    } else if (cur < max && gobj) {
      if (!!gobj.isParameter && gobj.isParameter()) {
        title = gobj.genus.replace(/(.*)(Parameter)/, '$1 $2');
      } else if (
        gobj.constraint === 'Calculation' ||
        gobj.constraint === 'Function'
      ) {
        title = gobj.constraint;
      }
      retVal = title + ' ' + (gobj.label ? gobj.label : '#' + gobj.id);
      if (cur > 0) {
        retVal = ', ' + retVal;
      }
    }
    return retVal;
  };

  const handleMessage = (msg) => {
    // msg has three properties: name, time, and data
    // for most events, data is the attributes of the WSP event
    const { attr } = msg;
    let gobj;
    if (!sketch) {
      getSketch();
    }
    console.log('Follower received msg:', msg.name, msg.attr);
    // If msg references a gobj, find it and attach to attr so handlers can access it.
    const id = attr.newId ? attr.newId : attr.gobjId;
    if (id) {
      gobj = sketch.gobjList.gobjects[id];
      attr.gobj = gobj;
    }
    if (msg.name.match('Widget')) {
      handleWidgetMessage(msg);
    } else {
      switch (msg.name) {
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
          // getSketch();
          initSketchPage();
          console.log(
            'Follower changed to page',
            attr.pageId,
            'in the sketch.'
          );
          // setTimeout (function () {notify('');}, 1000);
          break;
        case 'GobjsUpdated': // gobjs have moved to new locations
          imposeGobjUpdates(attr);
          break;
        case 'StartDragConfirmed': // highlight the dragged gobj
          // Do we need to turn glowing off during the drag?
          notify('Dragging ' + gobjDesc(attr.gobj), {
            persist: true,
            dragging: true,
            highlitGobjs: attr.gobj,
          });
          break;
        case 'EndDrag': // the drag ended
          notify('Drag ended for ' + gobjDesc(attr.gobj), {
            highlitGobjs: attr.gobj,
          });
          break;
        case 'EndLabelDrag': // a label drag ended
          // Is it worthwhile tracking the label drag in process? Probably not.
          attr.gobj.setLabelPosition(
            window.GSP.GeometricPoint(attr.newPos),
            window.GSP.GeometricPoint(attr.cornerDelta)
          );
          window.WIDGETS.invalidateLabel(attr.gobj);
          notify(attr.action + ' label of ' + gobjDesc(attr.gobj), {
            highlitGobjs: attr.gobj,
          });
          break;
        // case 'ToolPlayBegan':
        case 'WillPlayTool': // controlling sketch will play a tool
          // Notification persists until the tool finishes or is canceled
          notify('Playing ' + attr.tool.name + ' Tool', {
            prepend: true,
            persist: true,
          });
          startFollowerTool(attr.tool.name);
          break;
        // Ignore ToolPlayBegan, as we simulate only user drags (not matches) during toolplay
        // To get all the internals right, we'd need to duplicate every snap and unsnap.
        // We still may need to keep a record of snapped gobjs to get the drags right.
        case 'ToolPlayed': // controlling sketch has played a tool
          notify('Finished playing ' + attr.tool.name + ' Tool', {
            prepend: true,
          });
          toolPlayed(attr);
          notify('');
          break;
        case 'ToolAborted': // controlling sketch has aborted a tool
          notify('Canceled ' + attr.tool.name + ' Tool', { prepend: true });
          abortFollowerTool();
          break;
        case 'MergeGobjs': // controlling sketch has merged a gobj
          gobjsMerged(attr);
          // the merged gobj may have been replaced
          notify('Merged ' + mergeGobjDesc(attr), attr.options);
          break;
        case 'WillUndoRedo': // controlling sketch will undo or redo
          notify('Performed ' + attr.type);
          break;
        case 'UndoRedo':
          undoRedo(attr);
          break;
        case 'EditExpression': // handles start, confirm, cancel for editing of params, calcs, and functions.
          editExpression(attr);
          break;
        case 'ClearTraces':
          notify('Traces cleared.');
          sketch.clearTraces();
          if (sketch._fadeTracesJob) {
            // Restart; otherwise current job will delay tracing until it ends
            sketch.stopFadeJob();
            sketch.startFadeJob(true);
          }
          break;
        case 'PrefChanged':
          prefChanged(attr);
          break;
        case 'PressButton':
          pressButton(attr);
          break;
        default:
          // Other messages to be defined: gobjEdited, gobjStyled, etc.
          throw new Error(`Unkown message type: ${msg.name}`);
      }
    }
  };

  const mergeGobjDesc = (attr) => {
    // given a merged gobj and info about what it was merged to
    // Three options for attr; all include gobjId.
    // point-point or param-value: mergeToId
    // point-path: pathId & pathValue
    // point-intersection: path1Id & path2Id
    let desc = gobjDesc(attr.gobjId) + ' to ';
    const mergeTo = attr.mergeToId || attr.pathId;
    const value = [attr.gobjId];
    const highlitGobjs = window.GSP._put(attr, 'options.highlitGobjs', value);
    if (mergeTo) {
      desc += gobjDesc(mergeTo);
      highlitGobjs.push(mergeTo);
    } else {
      // must be a point to intersection merge
      desc +=
        ' the intersection of ' +
        gobjDesc(attr.path1Id) +
        ' and ' +
        gobjDesc(attr.path2Id);
      highlitGobjs.push(attr.path1Id, attr.path2Id);
    }
    return desc;
  };

  function handleWidgetMessage(msg) {
    const name = msg.name.substring(0, msg.name.indexOf('Widget'));
    const { attr } = msg;
    const handlePrePost = ['Style', 'Visibility', 'Trace'];
    let note = name + ' Widget ';
    let persist;
    function doHandleWidget() {
      switch (name) {
        case 'Style':
          handleStyleWidget(attr);
          break;
        case 'Trace':
          handleTraceWidget(attr);
          break;
        case 'Label':
          handleLabelWidget(attr);
          break;
        case 'Visibility':
          handleVisibilityWidget(attr);
          break;
        case 'Delete':
          handleDeleteWidget(attr);
          break;
        default:
          console.log('No widget handler for name: ', name);
      }
    }

    function handlePrompt(display) {
      // attr includes the display style for the widget prompt
      var sel = '#w' + name + 'Prompt';
      $(sel).css('display', display);
    }

    if (attr.action === 'activate') {
      persist = true;
      note += attr.restoring ? 'restored:' : 'activated:';
    } else if (attr.action === 'deactivate') {
      note += 'deactivated.';
    } else {
      doHandleWidget(); // Neither activate nor deactivate
      return;
    } // Only activate & deactivate left
    notify(note, { persist: persist, prepend: true });
    if (handlePrePost.indexOf(name) >= 0) {
      doHandleWidget(); // Some widgets (e.g., style, visibility) need to handle activate/deactivate messages.
    }
    if (attr.promptDisplay) {
      handlePrompt(attr.promptDisplay);
    }
  }

  const notify = (text, options) => {
    // options are duration, highlightGobjs, prepend, and dragging
    // options.prepend causes the message to be prepended to the normal notify div
    // options.duration must be a non-zero number or 'persist'; it's 2500 if not specified
    // options.dragging prevents highlighting of a traced dragged gobj (which interferes with tracing)
    let duration = 2500;
    let gobjs;
    let callback;
    let prepend = false;
    if (options) {
      if (options.duration) {
        ({ duration } = options);
      }
      if (options.prepend) {
        // need seperate div + handling for 'prenotify'
        prepend = true;
      }
      gobjs = options.highlitGobjs || []; // empty array if no highlightGobjs
      if (!Array.isArray(gobjs)) {
        // if a single gobj is passed, make an array.
        gobjs = [gobjs];
      }
      ({ callback } = options);
    }

    const highlight = (on) => {
      // console.log('highlight:', text, 'options:', options, 'on:', on);
      if (highLights.length > 0) {
        // Whether on or off, remove previous highlights
        highLights.forEach((gobj) => {
          const { state } = gobj;
          if (state.oldRenderState) {
            state.renderState = state.oldRenderState;
            delete state.oldRenderState;
            gobj.invalidateAppearance();
          }
        });
        setHighLights([]);
      }
      if (!gobjs) return; // Nothing to do
      gobjs.forEach((gobj) => {
        // this may be a gobj, or may be a gobj id
        console.log('Notifying: ', gobj);
        gobj = typeof gobj === 'string' ? sketch.gobjList.gobjects[gobj] : gobj;
        if (!gobj) return;
        const { state } = gobj;
        if (!state) return;
        // highlighting interferes with tracing: don't highlight a traced dragged gobj
        if (on && !(gobj.style.traced && options.dragging)) {
          if (state.renderState && !state.oldRenderState) {
            state.oldRenderState = state.renderState; // track the previous renderState
          }
          state.renderState = 'targetHighlit';
          setHighLights(...highLights, gobj); // track this gobj as highlighted
        } else {
          // off
          if (state.renderState === 'targetHighlit') {
            if (
              state.oldRenderState &&
              state.oldRenderState !== 'targetHighlit'
            ) {
              // prev renderState existed, so restore it
              state.renderState = state.oldRenderState;
            } else {
              // prev renderState didn't exist, so restore its non-existence
              delete state.renderState;
            }
          }
          delete state.oldRenderState; // delete tracked prev value, if any
          setHighLights([]);
        }
        gobj.invalidateAppearance();
      });
    };
    // console.log(`Notify: ${text}, duration: ${duration}`);
    // let $notifyDiv = $('#notify');
    if (text) {
      if (prepend) {
        setPrependMessage(text);
      } else {
        setActivityMessage(text);
      }
      highlight(true);
      if (!options || !options.persist) {
        setTimeout(() => {
          // only hide the notification if it's the same text as was set.
          if (prepend) {
            setPrependMessage('');
          } else {
            setActivityMessage('');
          }
          highlight(false);
          if (callback) {
            callback();
          }
        }, duration);
      }
    } else if (prepend) {
      highlight(false); // empty text also turns off highlighting.
      // The caller must ensure that options.highlitGobjs is the same as for the original notify() call
      setPrependMessage('');
    } else {
      highlight(false); // empty text also turns off highlighting.
      // The caller must ensure that options.highlitGobjs is the same as for the original notify() call
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
      // console.log("Messaging error: this follower's sketch is not loaded.");
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
      // Use the properties of gobjInfo to determine what needs updating
      if (gobjInfo.loc) {
        setLoc(destGobj.geom.loc, gobjInfo.loc);
      }
      if (gobjInfo.value) {
        destGobj.value = gobjInfo.value;
      }
      if (gobjInfo.expression) {
        // Update param after it's changed
        destGobj.expression = gobjInfo.expression;
        // Is there anything else to do for an expression?
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
    let { current } = history;
    if (data.preDelta) {
      current.next = { delta: data.preDelta, prev: current, next: null };
      history.redo();
      current = history.current; // history.redo() changes current.
    }
    current.next = { delta: data.delta, prev: current, next: null };
    sketchDoc.redo();
    data.gobjId = data.newId;
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

  const handleStyleWidget = (attr) => {
    let gobjCount = 0;
    const gobjIds = [];
    const maxCount = 4;
    let note = attr.canceled
      ? 'Canceled style changes for '
      : 'Changed style for ';
    // eslint-disable-next-line
    console.log('attr changes: ', attr);
    if (attr.changes && attr.changes.length > 0) {
      attr.changes.forEach((change) => {
        const gobj = sketch.gobjList.gobjects[change.id];
        gobjIds.push(change.id);
        gobj.style = change.style;
        gobj.invalidateAppearance();
        note += gobjDesc(gobj, gobjCount, maxCount);
        gobjCount += 1;
      });
    } else {
      if (attr.action === 'activate') {
        note = 'Initialized style widget...';
      }
    }
    notify(note, { duration: 3000, highlitGobjs: gobjIds });
  };

  function handleTraceWidget(attr) {
    // const change = attr.changes[0]; // Note the assumption: there's only a single gobj being changed
    // const gobj = sketch.gobjList.gobjects[change.id];
    // const note =
    //   'Tracing turned ' +
    //   (change.traced ? 'on' : 'off') +
    //   ' for ' +
    //   gobjDesc(gobj, 0, 1);
    // gobj.style.traced = change.traced;
    // notify(note, { duration: 2000, highlitGobjs: [gobj.id] });
    let gobj = attr.gobj;
    let options = { duration: 2500 };
    let note;
    let toggled;
    let cBox;
    console.log('Handling Trace Message:', attr);
    if (gobj) {
      options.highlitGobjs = [gobj.id];
    }
    const WIDGETS = window.WIDGETS;
    switch (attr.action) {
      case 'activate':
      case 'deactivate':
        WIDGETS.toggleTraceModality();
        toggled = true;
        break;
      case 'changed':
        gobj = sketch.gobjList.gobjects[attr.gobjId];
        WIDGETS.toggleGobjTracing(gobj, attr.traced);
        note =
          'Tracing turned ' +
          (attr.traced ? 'on' : 'off') +
          ' for ' +
          gobjDesc(gobj, 0, 1);
        break;
      case 'enabled':
        cBox = $('#wTraceEnabled')[0];
        toggled = !attr.enabled != !cBox.checked; // set toggled only if the value will be changed
        if (toggled) {
          WIDGETS.setTraceEnabling(attr.enabled);
          cBox.checked = attr.enabled;
          note = 'Tracing ' + (attr.enabled ? 'enabled' : 'disabled') + '.';
        }
        break;
      case 'fading':
        WIDGETS.setTraceFading(attr.fading);
        note = 'Trace fading turned ' + (attr.fading ? 'on' : 'off') + '.';
        break;
      case 'glowing':
        // glowing action is sent when glowing is turned on or off for traced gobjs
        // The controller also turns off glowing during a drag; does the follower need to do so also?
        note =
          'Glowing for traced objects turned ' +
          (attr.glowing ? 'on' : 'off') +
          '.';
        WIDGETS.setTraceGlowing(attr.glowing);
        break;
    }
    if (!toggled && note) {
      $('#wTracePrompt').css('display', 'none');
      notify(note, options);
    }
  }

  function handleLabelWidget(attr) {
    // attr: gobjId is always present, other properties only if changed:
    // text (the label or text), styleJson (stringified), and autoGenerate (for shouldAutogenerateLabel).
    if (!sketch) {
      getSketch();
    }
    console.log('Sketch: ', sketch, ' Attr: ', attr);
    const gobj = attr.gobj;
    let note = attr.action || 'Modified';
    if (attr.labelStyle) {
      gobj.style.label = attr.labelStyle;
    }
    if (attr.autoGenerate) {
      gobj.shouldAutogenerateLabel = attr.autoGenerate;
    }
    if (attr.labelSpec && attr.labelSpec.location) {
      gobj.labelSpec.location = window.GSP.GeometricPoint(
        attr.labelSpec.location
      );
    }
    if (attr.autoGenerateLabel) {
      gobj.autoGenerateLabel = attr.autoGenerateLabel;
    }
    if (attr.text) {
      window.WIDGETS.labelChanged(attr.text, gobj);
      // gobj.setLabel() exists only for gobjs with gobj.hasLabel === true
      // WIDGETS.LabelChanged applies to all labeled gobjs (e.g. functions)
      // gobj.setLabel(attr.text);
      // ADD SUPPORT HERE FOR CHANGING TEXT OBJECTS (E.G., CAPTIONS)
    }
    window.WIDGETS.invalidateLabel(gobj);
    note += ' label of ' + gobjDesc(gobj) + '.';
    notify(note, { duration: 2000, highlitGobjs: [attr.gobjId] });
    // gobj.invalidateAppearance();
  }

  function handleVisibilityWidget(attr) {
    let note;
    // This handler handles activate/deactivate actions
    if (attr.action.match('activate')) {
      // matches both activate & deactivate
      window.WIDGETS.toggleVisibilityModality();
    } else {
      $.each(attr.changes, function() {
        const gobj = sketch.gobjList.gobjects[this.id];
        note = this.style.faded ? 'Hid ' : 'Showed ';
        gobj.style = this.style;
        gobj.invalidateAppearance();
        note += gobjDesc(gobj);
        notify(note, { duration: 2500, highlitGobjs: [gobj] });
      });
      // Ideally the notify timeout would fade the changed objects in and out while the notice is up
      // We could provide a callback that would send a parameter that runs from 0 to 100 during the timeout
      // For the time being, we could show the hidden objects, trigger the notification, and then
      // hid the visible objects.
    }
  }

  function handleDeleteWidget(attr) {
    let note = '';
    const deletedGobjs = {};
    let thisDelta;
    let descendantsExist = false;
    function doDelete() {
      sketch.gobjList.removeGObjects(deletedGobjs, sketch);
      thisDelta = sketch.document.pushConfirmedSketchOpDelta(attr.preDelta);
      // CHECK: thisDelta should match attr.delta.
      console.log('Delete delta: ', thisDelta, ' vs ', attr.delta);
      sketch.document.changedUIMode();
    }
    attr.deletedIds.forEach((id) => {
      const gobj = sketch.gobjList.gobjects[id];
      if (!note) {
        note = 'Deleted ' + gobjDesc(gobj);
      } else if (!descendantsExist) {
        note += ' and its descendants.'; // append this on second gobj
        descendantsExist = true;
      }
      deletedGobjs[id] = gobj;
    });

    notify(note + ' and its descendants.', {
      duration: 3000,
      highlitGobjs: attr.deletedIds,
      callback: doDelete,
    });
  }

  function editExpression(attr) {
    // handles start, confirm, cancel for editing of params, calcs, and functions.
    const action = attr.action;
    const gobj = attr.gobj;
    const gobjects = sketch.gobjList.gobjects;
    notify(action + ' editing ' + gobjDesc(gobj), {
      duration: 2000,
      highlitGobjs: [gobj],
    });
    // For 'Started' or 'Canceled', the notification is all that's needed.
    if (attr.action === 'Confirmed' && gobj) {
      if (attr.parentIds) {
        attr.parentIds.forEach(function(par, ix) {
          gobj.parents[ix] = gobjects[par];
        });
      }
      if (attr.expression) {
        gobj.expression = attr.expression;
      }
      if (attr.expressionType) {
        gobj.expressionType = attr.expressionType;
      }
      if (attr.functionExpr) {
        gobj.functionExpr = attr.functionExpr;
      }
      if (attr.infix) {
        gobj.parsedInfix = attr.infix;
      }
      if (gobj.isParameter()) {
        gobj.setEditedValue(attr.expression); // This works for params; does it work for others?
      } else {
        // Function or Calculation
        gobj.expressionAndParentsWereUpdated();
      }
    }
  }

  function prefChanged(attr) {
    // attr has category, pref, oldValue, & newValue
    const note =
      'Changed ' +
      attr.pref +
      ' preference from ' +
      attr.oldValue +
      ' to ' +
      attr.newValue;
    if (attr.category === 'units') {
      window.PREF.setUnitPref($sketch, attr.pref, attr.newValue);
      notify(note, { duration: 2000 });
    } else {
      window.GSP.createError(
        'follow: prefChanged cannot handle category ' + attr.category
      );
    }
  }

  function pressButton(attr) {
    // attr has category, pref, oldValue, & newValue
    const note = attr.gobj
      ? 'Pressed ' + attr.gobj.label + ' button'
      : 'Button pressed';
    notify(note, { duration: 2000, highlitGobjs: [attr.gobj] });
    // How can we tell start from stop, or rather, how can we use attr
    // to transmit the button's render state (and whether to turn it on or off)
    // Animate and Move, for instance, are very different in how they stop.
    // attr.gobj.press();
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
    checkWidgets();
  };

  const checkWidgets = async () => {
    await new Promise((r) => setTimeout(r, 350));
    if (!document.getElementById('widget')) {
      console.log('~~~~ No Widget id! ~~~~~');
      // window.location.reload();
      WSPLoader(loadSketch);
    }
  };

  const getSketchConfig = (tab) => {
    let config = tab.ggbFile
      ? JSON.parse(Buffer.from(tab.ggbFile, 'base64'))
      : testConfig;

    if (tab.currentStateBase64 && tab.currentStateBase64 !== '{}') {
      // existing event data on tab
      const { currentStateBase64 } = tab;
      config = JSON.parse(currentStateBase64);
    } else if (tab.startingPointBase64 && tab.startingPointBase64 !== '{}') {
      // starting point data on tab
      const { startingPointBase64 } = tab;
      config = JSON.parse(startingPointBase64);
    }
    return config;
  };

  const loadSketch = () => {
    const { tab } = props;
    const isWidgetLoaded = () => {
      return !!(
        window.UTILMENU &&
        !!window.UTILMENU.initUtils &&
        window.PAGENUM &&
        !!window.PAGENUM.initPageControls &&
        window.WIDGETS &&
        !!window.WIDGETS.initWidget
      );
    };
    // When should this call happen, before or after loading the sketch?
    console.log('Widgets?: ', isWidgetLoaded());
    if (isWidgetLoaded()) {
      window.WIDGETS.initWidget();
      window.PAGENUM.initPageControls();
      window.UTILMENU.initUtils();
      loadSketchDoc(getSketchConfig(tab));
      // establish sketch listeners for handlers
      syncToFollower();
    } else {
      const pollDOM = () => {
        console.log('Widgets recheck: ', isWidgetLoaded());
        if (isWidgetLoaded()) {
          loadSketchDoc(getSketchConfig(tab));
          syncToFollower();
        } else {
          setTimeout(pollDOM, 150); // try again in 150 milliseconds
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
      {(activityMessage || persistMessage) && (
        <div className={classes.Toast}>
          {persistMessage} {activityMessage || '...'}
        </div>
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
  updatedRoom: PropTypes.func.isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
  addToLog: PropTypes.func.isRequired,
  emitEvent: PropTypes.func.isRequired,
};

export default WebSketch;
