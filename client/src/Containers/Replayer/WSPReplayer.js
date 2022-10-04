/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import testConfig from '../Workspace/Tools/test.json';
import WSPLoader from '../Workspace/Tools/WSPLoader';

import classes from './WSPReplayer.css';

const WebSketch = (props) => {
  const [activityMessage, setActivityMessage] = useState('');
  const [persistMessage, setPrependMessage] = useState('');
  const [highLights, setHighLights] = useState([]); // Array of highlighted gobjs that must be turned off when new gobjs are highlighted
  // Note that highLights represents a state that needs to persist over handleMessage calls.
  const [jumping, setJumping] = useState(false);

  let $sketch = null; // the jquery object for the server's sketch_canvas HTML element
  let sketchDoc = null; // The WSP document in which the websketch lives.
  let sketch = null; // The websketch itself, which we'll keep in sync with the server websketch.
  const wspSketch = useRef();
  const { index, log, tab } = props;

  useEffect(() => {
    // load required files and then the sketch when ready
    WSPLoader(loadSketch);
    return () => {
      console.log('WSP activity ending - clean up listeners');
    };
  }, []);

  // Get the previous value (was passed into hook on last render)
  const prevIndex = usePrevious(index);

  // Hook
  function usePrevious(value) {
    // The ref object is a generic container whose current property is mutable ...
    // ... and can hold any value, similar to an instance property on a class
    const ref = useRef();
    // Store current value in ref
    useEffect(() => {
      ref.current = value;
    }, [value]); // Only re-run if value changes
    // Return previous value (happens before update in useEffect above)
    return ref.current;
  }

  // Handle new Events- escapes initialization scope
  useEffect(() => {
    // if (wspSketch) {
    updateSketch();
    // }
  }, [index]);

  // function that parses new log for event data
  const updateSketch = () => {
    // consider comparing to previous index and handling large jumps forward/backward with squashed updates from initial
    // Take updated player data with new Player state to update
    const newData = log[index] ? log[index].currentState : null;
    if (newData) {
      const updatesState = JSON.parse(newData);
      console.log(
        'Index: ',
        index,
        ', Prev: ',
        prevIndex,
        ' New data ',
        updatesState
      );
      if (index - prevIndex === 1) {
        handleMessage(updatesState);
      } else {
        console.log('handling jump!');
        handleJump(index, prevIndex);
      }
    }
  };

  async function handleJump(ind, prevInd) {
    // timer can be used to 'show' changes applied in fast-forward - must make func async!
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    setJumping(true);
    await timer(0);
    // jumping forward
    if (ind > prevInd) {
      for (let i = prevInd + 1; i <= ind; i++) {
        const newData = log[i] ? log[i].currentState : null;
        if (newData) {
          const updatesState = JSON.parse(newData);
          handleMessage(updatesState);
          await timer(0); // optional to show changes
        }
      }
    } else {
      // jumping back
      loadSKetchDoc(getSketchConfig(tab));
      for (let i = 1; i <= ind; i++) {
        const newData = log[i] ? log[i].currentState : null;
        if (newData) {
          const updatesState = JSON.parse(newData);
          handleMessage(updatesState);
          // await timer(0); // optional to show changes
        }
      }
    }
    setJumping(false);
  }

  const handleMessage = (msg) => {
    // msg has three properties: name, time, and data
    // for most events, data is the attributes of the WSP event
    if (!sketchDoc) {
      console.log('Setting sketc doc');
      const sketchEl = window.jQuery('#sketch');
      sketchDoc = sketchEl.data('document');
      sketch = sketchDoc.focusPage;
    }
    const { attr } = msg;
    function selfSent() {
      const sender = msg.sender;
      let ret = false;
      if (sender) {
        const canvas = $sketch[0];
        const receiver = { id: canvas.id, baseURI: canvas.baseURI };
        ret = sender.id === receiver.id && sender.baseURI === receiver.baseURI;
        if (ret)
          GSP.createError(
            'follow: handleMessage: received a self-sent message.'
          );
      }
      return ret;
    }
    if (selfSent()) return; // ignore messages from this follower sketch

    if (attr.gobjId) {
      attr.gobj = sketch.gobjList.gobjects[attr.gobjId];
      if (!attr.gobj)
        console.error('follow.handleMessage(): msg.attr has a bad gobj.');
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
        // case 'ToolPlayBegan':
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
        case 'MergeGobjs': // controlling sketch has merged a gobj
          gobjsMerged(attr);
          // the merged gobj may have been replaced
          notify('Merged ' + mergeGobjDesc(attr), attr.options);
          break;
        case 'WillUndoRedo': // controlling sketch will undo or redo
          notify('Performing ' + attr.type);
          break;
        case 'UndoRedo':
          undoRedo(attr);
          break;
        case 'StartEditParameter': // These messages notify the user; an update message actually performs the update
          paramEdit('Started', attr);
          break;
        case 'CancelEditParameter': // These messages notify the user; an update message actually performs the update
          paramEdit('Canceled', attr);
          break;
        case 'EditParameter':
          paramEdit('Finished', attr);
          break;
        case 'ClearTraces':
          notify('Traces cleared.');
          sketch.clearTraces();
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

  const initSketchPage = () => {
    // Refresh vars and handlers for a new sketch page
    // This needs to be called any time the sketch page is regenerated, for instance,
    // due to a page change, undo or redo, or confirmed or aborted toolplay
    // Ideally we'd like every such operation to clean up after itself by calling
    // initSketch, but the possibility of asynchronous operations suggests that
    // it may be safest to call getSketch(): a function that returns the sketch
    // object from the sketchDoc.
    if (!$sketch) {
      const $ = window.jQuery;
      $sketch = $('#sketch');
    }
    if ($sketch.data('document') !== sketchDoc) {
      console.error('follow: initSketchPage found invalid sketchDoc');
      window.GSP.createError('follow: initSketchPage found invalid sketchDoc.');
    }
    sketch = sketchDoc.focusPage;
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
    let retVal = '';
    if (typeof gobj === 'string') {
      gobj = sketch.gobjList.gobjects[gobj];
      if (!(gobj && gobj.id && gobj.kind))
        console.error('follow.gobjDesc() gobj param is neither string nor id.');
    }
    if (typeof cur === 'undefined') {
      cur = 0;
      max = 1;
    }
    if (cur === max) {
      retVal = ', ...';
    } else if (cur < max && gobj) {
      retVal = gobj.kind + ' ' + (gobj.label ? gobj.label : '#' + gobj.id);
      if (cur > 0) {
        retVal = ', ' + retVal;
      }
    }
    return retVal;
  };

  function handleWidgetMessage(msg) {
    const name = msg.name.substring(0, msg.name.indexOf('Widget'));
    const { attr } = msg;
    const handlePrePost = ['Style', 'Visibility', 'Trace'];
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
      notify(name + ' widget activated:', { persist: true, prepend: true });
    } else if (attr.action === 'deactivate') {
      notify(name + ' widget deactivated.', { prepend: true });
    } else {
      doHandleWidget(); // Neither activate nor deactivate
      return;
    } // Only activate & deactivate left
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
        duration = options.duration;
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
      callback = options.callback;
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
      if (!gobjs) return;
      gobjs.forEach((gobj) => {
        // this may be a gobj, or may be a gobj id
        if (typeof gobj === 'string') {
          console.log('STRING GOBJ: ', gobj, sketch.gobjList);
          if (sketch && sketch.gobjList && sketch.gobjList.gobjects) {
            gobj = sketch.gobjList.gobjects[gobj];
          }
        }
        if (!gobj) return; // Nothing to do
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
        // case 'Calculation':
        case 'Free':
          if (gobjInfo.loc) {
            setLoc(destGobj.geom.loc, gobjInfo.loc);
          }
          if (gobjInfo.value) {
            destGobj.value = gobjInfo.value;
          }
          if (gobjInfo.expression) {
            // Update param after it's changed
            destGobj.expression = gobjInfo.expression;
          }
          break;
        case 'PointOnPath':
        case 'PointOnPolygonEdge':
          destGobj.value = gobjInfo.value;
          break;
        case 'Calculation':
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
    if (data.newId) {
      // newId exists only if the original gobj has changed its id
      data.gobjId = data.newId;
    }
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
    let gobj = sketch.gobjList.gobjects[attr.gobjId];
    let options = { duration: 2500 };
    let note;
    let toggled;
    let cBox;
    console.log('Handling Trace Message:', attr);
    if (gobj) {
      options.highlitGobjs = [gobj.id];
    }
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
    const gobj =
      sketch.gobjList.gobjects[attr.sketch.gobjList.gobjects[attr.gobjId]];
    const labelChanged = attr.label !== 'gobj.label';
    let note = (note = 'Modified ');
    if (attr.text) {
      gobj.setLabel(attr.text);
      // ADD SUPPORT HERE FOR CHANGING TEXT OBJECTS (E.G., CAPTIONS)
    }
    note += gobjDesc(gobj) + ' label.';
    if (attr.styleJson) {
      gobj.style = JSON.parse(attr.styleJson);
    }
    if (attr.autoGenerate) {
      gobj.shouldAutogenerateLabel = attr.autoGenerate;
    }
    notify(note, { duration: 2000, highlitGobjs: [attr.gobjId] });
    if (attr.autoGenerateLabel) {
      gobj.autoGenerateLabel = attr.autoGenerateLabel;
    }
    gobj.invalidateAppearance();
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
    let note = ' ';
    const deletedGobjs = {};
    let thisDelta;
    let gobjCount = 0;
    const maxCount = 6;

    function doDelete() {
      sketch.gobjList.removeGObjects(deletedGobjs, sketch);
      thisDelta = sketch.document.pushConfirmedSketchOpDelta(attr.preDelta);
      // CHECK: thisDelta should match attr.delta.
      console.log('Delete delta: ', thisDelta, ' vs ', attr.delta);
      sketch.document.changedUIMode();
    }
    // TODO - refactor
    $.each(attr.deletedIds, function() {
      const gobj = sketch.gobjList.gobjects[this];
      if (!note) {
        note = 'Deleted ' + gobjDesc(gobj);
      }
      deletedGobjs[this] = gobj;
    });

    notify(note + ' and its descendants.', {
      duration: 3000,
      highlitGobjs: attr.deletedIds,
      callback: doDelete,
    });
  }

  function paramEdit(reason, attr) {
    // state is editStarted, changesNotAccepted, or changesAccepted
    const gobj = sketch.gobjList.gobjects[attr.gobjId];
    let note = reason;
    note += ' parameter edit: <em>' + gobj.label + '</em>';
    notify(note, { duration: 2000, highlitGobjs: [attr.gobjId] });
  }

  // --- Initialization functions ---

  const getSketch = () => {
    // Call this whenever the sketch doc may have changed.
    // e.g., page changes, start of toolplay, undo/redo, etc.
    if (!$sketch) {
      const $ = window.jQuery;
      $sketch = $('#sketch');
    }
    sketchDoc = $sketch.data('document');
    sketch = sketchDoc && sketchDoc.focusPage;
    if (!sketch) {
      console.error('getSketch() failed to find the sketch.');
    }
    return sketch;
  };

  const getSketchConfig = (tab) => {
    let config = tab.ggbFile
      ? JSON.parse(Buffer.from(tab.ggbFile, 'base64'))
      : testConfig;
    return config;
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
      },
    });
    const data = $sketch.data('document');
    console.log('Found data: ', data);
    sketchDoc = data;
    sketch = data.focusPage;
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
      // syncToFollower();
      props.setTabLoaded(tab._id);
    } else {
      const pollDOM = () => {
        isWidgetLoaded = window.UTILMENU && !!window.UTILMENU.initUtils;
        console.log('Widgets recheck: ', isWidgetLoaded);
        if (isWidgetLoaded) {
          loadSKetchDoc(getSketchConfig(tab));
          props.setTabLoaded(tab._id);
        } else {
          setTimeout(pollDOM, 100); // try again in 100 milliseconds
        }
      };
      pollDOM();
    }
  };
  return (
    <Fragment>
      {(activityMessage || persistMessage) && (
        <div className={classes.Toast}>
          {persistMessage} {activityMessage || '...'}
        </div>
      )}
      {jumping && (
        <div className={`${classes.Toast} ${classes.Ntf}`}>
          Applying changes...
        </div>
      )}
      <div
        className="sketch_container"
        id="calculatorParent"
        // style={{
        //   height: '890px', // @TODO this needs to be adjusted based on the Player instance.
        // }}
      >
        <div
          className="sketch_canvas"
          id="sketch"
          ref={wspSketch}
          style={{
            overflow: 'auto',
            pointerEvents: 'none',
          }}
        />
        <div className="buttonPane">
          <div
            className="page_buttons"
            style={{
              overflow: 'auto',
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
    </Fragment>
  );
};

WebSketch.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  index: PropTypes.number.isRequired,
  tab: PropTypes.shape({}).isRequired,
  setTabLoaded: PropTypes.func.isRequired,
  // room: PropTypes.shape({}).isRequired,
  // tab: PropTypes.shape({}).isRequired,
  // user: PropTypes.shape({}).isRequired,
  // myColor: PropTypes.string.isRequired,
  // updatedRoom: PropTypes.func.isRequired,
  // setFirstTabLoaded: PropTypes.func.isRequired,
  // addNtfToTabs: PropTypes.func.isRequired,
};

export default WebSketch;
