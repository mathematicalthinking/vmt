/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import testConfig from '../Workspace/Tools/test.json';
import WSPLoader from '../Workspace/Tools/WSPLoader';

import classes from './WSPReplayer.css';

const WebSketch = (props) => {
  const [activityMessage, setActivityMessage] = useState('');

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
      case 'GobjsUpdated': // gobjs have moved to new locations
        imposeGobjUpdates(data);
        break;
      case 'WillPlayTool': // controlling sketch has played a tool
        notify('Playing ' + data.tool.name + ' Tool');
        startFollowerTool(data.tool.name);
        break;
      case 'ToolPlayed': // controlling sketch has played a tool
        toolPlayed(data);
        notify('');
        break;
      case 'ToolAborted': // controlling sketch has aborted a tool
        notify('Canceled ' + data.tool.name + ' Tool', 1500);
        abortFollowerTool();
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

  const syncToFollower = () => {
    // We must be specific to avoid disconnecting other handlers for page changes, toolplay, etc.
    const handlers = [
      { event: 'WillChangeCurrentPage.WSP', handler: reflectMessage },
      { event: 'DidChangeCurrentPage.WSP', handler: reflectAndSync },
      { event: 'WillPlayTool.WSP', handler: reflectMessage },
      { event: 'ToolPlayed.WSP', handler: reflectAndSync },
      { event: 'ToolPlayBegan.WSP', handler: reflectMessage }, // Tool objects are instantiated, so track them
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
    // console.log('Synchronizing drags');
    syncGobjUpdates();
  };

  const syncGobjUpdates = () => {
    const updateSel =
      'Expression,Button,DOMKind,[constraint="Free"],[isFreePointOnPath="true"]';
    const gobjsToUpdate = sketch.sQuery(updateSel);
    gobjsToUpdate.on('update', recordGobjUpdate);
  };

  const reflectMessage = (event, context, attr) => {
    // console.log('Send message: ', event.type);
  };

  const reflectAndSync = (event, context, attr) => {
    syncToFollower();
  };

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
    }
  };

  const imposeGobjUpdates = (data) => {
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
    console.log('Imposing Gobj Updates: ', moveList);
    // eslint-disable-next-line
    for (let id in moveList) {
      const gobjInfo = moveList[id];
      console.log('Imposing Gobj: ', gobjInfo);
      const destGobj = sketch.gobjList.gobjects[id];
      if (!destGobj) {
        console.log('No destGobj! ', sketch.gobjList);
        continue; // The moveList might be out of date during toolplay,
        // and could include a gobj that no longer exists.
      }
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
            'follower does not handle constraint',
            gobjInfo.constraint
          );
      }
      destGobj.invalidateGeom();
    }
  };

  const toolPlayed = (data) => {
    const controller = sketch.toolController;
    const history = sketchDoc.getCurrentPageData().session.history;
    controller.confirmActiveTool(); // Uses the follower delta instead of the passed delta
    sketchDoc.undo();
    history.current.next.delta = data.delta;
    sketchDoc.redo();
    sketch = sketchDoc.focusPage; // Required after toolplay & undo/redo
  };

  const startFollowerTool = (name) => {
    let tool;
    sketchDoc.tools.some((aTool) => {
      if (aTool.metadata.name === name) {
        tool = aTool;
        return true;
      }
      return false;
    });
    sketch.toolController.setActiveTool(tool);
  };

  const abortFollowerTool = () => {
    sketch.toolController.abortActiveTool();
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
    sketch = sketchDoc.focusPage; // Required after toolplay & undo/redo
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
      syncToFollower();
      props.setTabLoaded(tab._id);
    } else {
      const pollDOM = () => {
        isWidgetLoaded = window.UTILMENU && !!window.UTILMENU.initUtils;
        console.log('Widgets recheck: ', isWidgetLoaded);
        if (isWidgetLoaded) {
          loadSKetchDoc(getSketchConfig(tab));
          syncToFollower();
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
      {activityMessage && (
        <div className={classes.Toast}>{activityMessage}</div>
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
