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

  let $sketch = null; // the jquery object for the server's sketch_canvas HTML element
  let sketchDoc = null; // The WSP document in which the websketch lives.
  let sketch = null; // The websketch itself, which we'll keep in sync with the server websketch.
  const wspSketch = useRef();
  const { index } = props;

  useEffect(() => {
    // load required files and then the sketch when ready
    WSPLoader(loadSketch);
    return () => {
      console.log('WSP activity ending - clean up listeners');
    };
  }, []);

  // Handle new Events- escapes initialization scope
  useEffect(() => {
    // if (wspSketch) {
    updateSketch();
    // }
  }, [index]);

  // function that parses new log for event data
  const updateSketch = () => {
    const { log } = props;
    // consider comparing to previous index and handling large jumps forward/backward with squashed updates from initial
    // Take updated player data with new Player state to update
    const newData = log[index] ? log[index].currentState : null;
    if (newData) {
      console.log('New data ', newData);
      const updatesState = JSON.parse(newData);
      handleMessage(updatesState);
    }
  };

  const handleMessage = (msg) => {
    if (!sketchDoc) {
      console.log('Setting sketc doc');
      const sketchEl = window.jQuery('#sketch');
      sketchDoc = sketchEl.data('document');
      sketch = sketchDoc.focusPage;
    }
    // msg has three properties: name, time, and data
    // for most events, data is the attributes of the WSP event
    const { attr } = msg;
    const mergeGobjDesc = (gobjInfo, toInfo) => {
      // given a merged gobj and info about what it was merged to
      const gobjs = sketch.gobjList.gobjects;
      let desc = ' ' + gobjDesc(gobjInfo) + ' ';
      // The merged gobj may have gone away, but gobjInfo recorded the kind, label, and id
      if (toInfo) {
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
      }
      return desc;
    };
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
          sketch = sketchDoc.focusPage;
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
    if (typeof cur === 'undefined') {
      cur = 0;
      max = 1;
    }
    if (cur === max) {
      retVal = ', ...';
    } else if (cur < max) {
      if (gobj) {
        retVal = gobj.kind + ' ' + (gobj.label ? gobj.label : '#' + gobj.id);
      }
      if (cur > 0) {
        retVal = ', ' + retVal;
      }
    }
    return retVal;
  };

  // const syncToFollower = () => {
  //   // most of this code shouldn't be needed in the replayer as it mirrors follower logic
  //   // We must be specific to avoid disconnecting other handlers for page changes, toolplay, etc.
  //   const handlers = [
  //     { event: 'WillChangeCurrentPage.WSP', handler: reflectMessage },
  //     { event: 'DidChangeCurrentPage.WSP', handler: reflectAndSync },
  //     { event: 'WillPlayTool.WSP', handler: reflectMessage },
  //     { event: 'ToolPlayed.WSP', handler: reflectAndSync },
  //     { event: 'ToolPlayBegan.WSP', handler: reflectMessage }, // Tool objects are instantiated, so track them
  //     { event: 'ToolAborted.WSP', handler: reflectMessage },
  //     { event: 'WillUndoRedo.WSP', handler: reflectMessage },
  //     { event: 'UndoRedo.WSP', handler: reflectAndSync },
  //   ];
  //   handlers.forEach((el) => {
  //     $sketch.off(el.event, el.handler);
  //   });
  //   handlers.forEach((el) => {
  //     $sketch.on(el.event, el.handler);
  //   });
  //   // Required after toolplay, undo/redo, and page changes
  //   sketch = sketchDoc.focusPage;
  //   // console.log('Synchronizing drags');
  //   syncGobjUpdates();
  // };

  // const syncGobjUpdates = () => {
  //   const updateSel =
  //     'Expression,Button,DOMKind,[constraint="Free"],[isFreePointOnPath="true"]';
  //   const gobjsToUpdate = sketch.sQuery(updateSel);
  //   gobjsToUpdate.on('update', recordGobjUpdate);
  // };

  // const reflectMessage = (event, context, attr) => {
  //   // console.log('Send message: ', event.type);
  // };

  // const reflectAndSync = (event, context, attr) => {
  //   syncToFollower();
  // };

  function handleWidgetMessage(msg) {
    const name = msg.name.substring(0, msg.name.indexOf('Widget'));
    const { attr } = msg;
    const handlePrePost = ['Style', 'Visibility'];
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
  }

  const notify = (text, options) => {
    // options.duration must be a non-zero number or 'persist'
    // options.prepend causes the message to be prepended to the normal notify div
    // duration is 2500 if not specified
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
      gobjs = options.highlitGobjs;
      callback = options.callback;
    }

    const highlight = (on) => {
      if (!gobjs) return;
      $.each(gobjs, () => {
        // this may be a gobj, or may be a gobj id
        const gobj =
          typeof this === 'string' ? sketch.gobjList.gobjects[this] : this;
        const { state } = gobj;
        if (!state) return;
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
      setPrependMessage('');
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
    sketch = sketchDoc.focusPage;
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
    let note;
    let gobjCount = 0;
    const gobjIds = [];
    const maxCount = 4;
    note = attr.canceled ? 'Canceled style changes for ' : 'Changed style for ';
    // eslint-disable-next-line
    console.log('attr changes: ', attr);
    // $.each(attr.changes, function() {
    //   const gobj = sketch.gobjList.gobjects[this.id];
    //   gobjIds.push(this.id);
    //   gobj.style = JSON.parse(this.style);
    //   gobj.invalidateAppearance();
    //   note += gobjDesc(gobj, gobjCount, maxCount);
    //   gobjCount += 1;
    // });
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
    const change = attr.changes[0]; // Note the assumption: there's only a single gobj being changed
    const gobj = sketch.gobjList.gobjects[change.id];
    const note =
      'Tracing turned ' +
      (change.traced ? 'on' : 'off') +
      ' for ' +
      gobjDesc(gobj, 0, 1);
    gobj.style.traced = change.traced;
    notify(note, { duration: 2000, highlitGobjs: [gobj.id] });
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
    let note = 'Deleted ';
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

    $.each(attr.deletedIds, function() {
      const gobj = sketch.gobjList.gobjects[this];
      deletedGobjs[this] = gobj;
      note += gobjDesc(gobj, gobjCount, maxCount);
      gobjCount += 1;
    });

    notify(note, {
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
      <div
        className="sketch_container"
        id="calculatorParent"
        // style={{
        //   height: '890px', // @TODO this needs to be adjusted based on the Player instance.
        // }}
      >
        <div className="sketch_canvas" id="sketch" ref={wspSketch} />
        {/* <div className="buttonPane">
          <div
            className="page_buttons"
            style={{
              overflow: 'auto',
              pointerEvents: !_hasControl() ? 'none' : 'auto',
            }}
          />
        </div> */}
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
