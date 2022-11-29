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
import testConfig from './Tools/test.json';
import WSPLoader from './Tools/WSPLoader';
import socket from '../../utils/sockets';
import API from '../../utils/apiRequests';

//   import classes from './graph.css';

const WebSketchEditor = (props) => {
  const [activityUpdates, setActivityUpdates] = useState();
  const [activityMoves, setActivityMoves] = useState({});
  // const [timeSent, setTimeSent] = useState(0);
  const [activityData, setActivityData] = useState();

  let initializing = false;
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

  // Handle new Events- escapes initialization scope
  useEffect(() => {
    recordGobjUpdate(activityUpdates);
  }, [activityUpdates]);

  useEffect(() => {
    handleEventData(activityData);
  }, [activityData]);

  // Storage API functions
  const debouncedUpdate = useCallback(debounce(putState, 250), []);

  function putState() {
    const { tab, activity, updateActivityTab } = props;
    if (!sketchDoc) {
      // console.log('Setting sketc doc');
      const sketchEl = window.jQuery('#sketch');
      sketchDoc = sketchEl.data('document');
    }
    // console.log('Sketch document: ', sketchDoc);
    if (sketchDoc) {
      // grab current state-event list
      const responseData = sketchDoc.getCurrentSpecObject();
      console.log('Response data: ', responseData);
      // start creating a string-based object to update the tab
      const updateObject = {
        startingPointBase64: JSON.stringify(responseData),
      };
      // get and add the current screen
      // if (calculatorInst.current) {
      //   updateObject.currentScreen = getCurrentScreen();
      // }
      API.put('tabs', tab._id, updateObject)
        .then(() => updateActivityTab(activity._id, tab._id, updateObject))
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  }

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
      { event: 'StartEditParameter.WSP', handler: reflectMessage },
      { event: 'CancelEditParameter.WSP', handler: reflectMessage },
      { event: 'EditParameter.WSP', handler: reflectMessage },
      { event: 'ClearTraces.WSP', handler: reflectMessage },
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
    const msg = { name: event.type, time: event.timeStamp, attr };
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
        case 'Free': // Free points have locations; free parameters have values and locations
          if (gobj.geom.loc) {
            // free points, params, etc. have locations
            gobjInfo.loc = gobj.geom.loc;
          }
          if (window.GSP.isParameter(gobj)) {
            gobjInfo.expression = gobj.expression;
          }
        // break;
        // Params should fall through, and there's no harm to points falling through as they don't have values.
        /* falls through */
        case 'Calculation': // Calculations have values; how do we distinguish which has been changed?
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
      // Don't bother with context; it has cycles and cannot easily be stringified
      const { id } = gobjInfo;
      setActivityMoves((prevMoves) => ({ ...prevMoves, [id]: gobjInfo }));
    }
  };

  useEffect(() => {
    postMoveMessage();
  }, [activityMoves]);

  function postMoveMessage() {
    const msg = { name: 'GobjsUpdated', time: Date.now() };
    const moveData = { ...activityMoves }; // create a ref to the current cache
    setActivityMoves({});
    if (Object.keys(moveData).length !== 0) {
      msg.attr = JSON.stringify(moveData); // stringify removes GeometricPoint prototype baggage.
      // msg ready to post to follower
      handleEventData(msg);
    }
  }

  // sends an update msg object for the user in control
  const handleEventData = (updates, type) => {
    if (initializing) return;
    // putState(); // save to db?
    debouncedUpdate();
    // use new json config with $('#sketch').data('document').getCurrentSpecObject()?
  };

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

    if (tab.startingPointBase64 && tab.startingPointBase64 !== '{}') {
      // existing event data on tab
      const { startingPointBase64 } = tab;
      config = JSON.parse(startingPointBase64);
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

  return (
    <Fragment>
      <div
        // className={classes.sketch_container}
        className="sketch_container"
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
        />
        <div className="buttonPane">
          <div className="page_buttons" />
        </div>
      </div>
    </Fragment>
  );
};

WebSketchEditor.propTypes = {
  activity: PropTypes.shape({}).isRequired,
  tab: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}),
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default WebSketchEditor;
