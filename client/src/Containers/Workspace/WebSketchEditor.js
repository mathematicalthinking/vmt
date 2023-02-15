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
import testConfig from './Tools/empty.json';
import { WSPLoader, loadTools } from './Tools/WSPLoader';
import socket from '../../utils/sockets';
import API from '../../utils/apiRequests';

import classes from './WebSketchEditor.css';

const WebSketchEditor = (props) => {
  const [activityUpdates, setActivityUpdates] = useState();
  const [activityMoves, setActivityMoves] = useState({});
  // const [timeSent, setTimeSent] = useState(0);
  const [activityData, setActivityData] = useState();
  const [sketchLoaded, setSketchLoaded] = useState(false);

  let initializing = false;
  let $sketch = null; // the jquery object for the server's sketch_canvas HTML element
  // let sketchDoc = null; // The WSP document in which the websketch lives.
  let sketch = null; // The websketch itself, which we'll keep in sync with the server websketch.
  const wspSketch = useRef();
  const sketchDoc = useRef(null);
  const hasWidgets = useRef(false);
  const tools = useRef(null);
  // const calculatorInst = useRef();
  // const pendingUpdate = React.createRef(null);
  let $ = window ? window.jQuery : undefined;
  const { setFirstTabLoaded } = props;

  useEffect(() => {
    initializing = true;
    setSketchLoaded(false);
    // load required files and then the sketch when ready
    WSPLoader(loadSketch);
    initializing = false;
    // fetchTools();
    console.log('~~ Page loaded!  ~~');
    return () => {
      socket.removeAllListeners('RECEIVE_EVENT');
      // window.UTILMENU = undefined;
      // do we need to unmount or destroy the wsp instance?
      console.log('WSP activity ending - clean up listeners');
    };
  }, []);

  useEffect(() => {
    // recordGobjUpdate(activityUpdates);
    debouncedUpdate();
  }, [activityUpdates]);
  // Storage API functions
  const debouncedUpdate = useCallback(debounce(putState, 250), []);

  async function fetchTools() {
    fetch(
      'https://geometricfunctions.org/fc/tools/library/basic/01%20Point,%20Compass,%20Straightedge%20Tools.json',
      // 'https://geometricfunctions.org/fc/tools/library/basic/',
      // 'https://cors-anywhere.herokuapp.com/https://geometricfunctions.org/fc/tools/library/basic/',
      // 'https://cors-anywhere.herokuapp.com/https://geometricfunctions.org/fc/tools/library/basic/01%20Point,%20Compass,%20Straightedge%20Tools.json',
      {
        method: 'GET',
        crossDomain: true,
        // headers: {
        //   'Content-Type': 'text/plain',
        // },
        // mode: 'no-cors',
        // credentials: 'include',
      }
    )
      .then((res) => {
        console.log('Got a site res: ', res);
        return res.text();
      })
      .then((json) => {
        // console.log('HTML: ', json);
        // Initialize the DOM parser
        // const parser = new DOMParser();

        // Parse the text
        // const doc = parser.parseFromString(html, 'text/html');

        // You can now even select part of that html as you would in the regular DOM
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        console.log(doc);
      })
      .catch(function(err) {
        console.log('Failed to fetch page: ', err);
      });
  }

  const getSketch = () => {
    // Call this whenever the sketch doc may have changed.
    // e.g., page changes, start of toolplay, undo/redo, etc.
    if (!$sketch) {
      $sketch = $('#sketch');
    }
    sketchDoc.current = $sketch.data('document');
    sketch = sketchDoc && sketchDoc.focusPage;
    if (!sketch) {
      console.error('getSketch() failed to find the sketch.');
    }
    return sketch;
  };

  // establish listeners
  const syncToFollower = () => {
    if (!sketch) {
      getSketch();
    }
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
      { event: 'ActivateButton.WSP', handler: reflectMessage },
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
    // if (BUTTON_TRACKING && GSP._get(context, 'gobj.kind') === 'Button') {
    //  let gobj = context.gobj, action = gobj.state.isActive ? 'activated ' : 'deactivated ';
    //  console.log("Main " + action + gobj.label + " button (" + gobj.id + ").");
    //}
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
    checkGraph();
    getSketch(); // Make sure we use the current sketch
    if (!sketch || !sketch.gobjList || sketch.gobjList.gobjects === null) {
      console.log('syncGobjUpdates found no gobjs to track.');
      getSketch();
      const defaultGobjsList = {
        gobjects: {},
        constraintList: [],
        renderList: [],
      };
      // sketch.gobjList.gobjects = defaultGobjsList;
    } else {
      gobjsToUpdate = sketch.sQuery(updateSel);
      gobjsToUpdate.on('update', setActivityUpdates);
    }
  };

  function putState() {
    const { tab, activity, updateActivityTab } = props;
    if (!sketchDoc.current && window.jQuery) {
      // console.log('Setting sketc doc');
      const sketchEl = window.jQuery('#sketch');
      sketchDoc.current = sketchEl.data('document');
    }
    // console.log('Sketch document: ', sketchDoc);
    if (sketchDoc.current) {
      // grab current state-event list
      const responseData = sketchDoc.current.getCurrentSpecObject();
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

  const checkGraph = () => {
    if (window.jQuery) {
      console.log(
        'Graph loaded? ',
        !!sketchDoc.current,
        $('#sketch').data('document'),
        ' vs ',
        sketchDoc.current
      );
      if (!$('#sketch').data('document')) {
        $('#sketch').data('document', sketchDoc.current);
        console.log('How about now? ', $('#sketch').data('document'));
      }
      // if (!!window.TOOLS) {
      //   window.TOOLS.initLibrary();
      // }
      // console.log(
      //   'After reloading library? ',
      //   sketchDoc.current,
      //   ' sketch: ',
      //   $('#sketch').data('document')
      // );
    }
  };

  // --- Initialization functions ---
  const leftPane = () => {
    checkGraph();
    return sketchLoaded ? (
      <div className={classes.leftPane}>
        <div>
          <label htmlFor="height">Height</label>
          <input
            type="number"
            id="height"
            className="uSizeButton"
            name="height"
            min="50"
            max="2000"
            defaultValue="352"
            onChange={
              () => {
                checkGraph();
                window.TOOLS && window.TOOLS.resetSketchWindowSize('sketch');
              }
              // window.TOOLS && window.TOOLS.resetSketchWindowSize('sketch')
            }
          ></input>
        </div>
        <div>
          <label htmlFor="width">Width</label>
          <input
            type="number"
            id="width"
            className="uSizeButton"
            name="width"
            min="50"
            max="2000"
            defaultValue="650"
            onChange={
              () => {
                checkGraph();
                window.TOOLS && window.TOOLS.resetSketchWindowSize('sketch');
              }
              // window.TOOLS && window.TOOLS.resetSketchWindowSize('sketch')
            }
          ></input>
        </div>
        <div id="uPagePane" className="uLeftSub">
          <input
            type="button"
            id="newPage"
            value="New Page"
            onClick={() => {
              console.log("Adding a new page via 'new'");
              checkGraph();
              window.TOOLS.insertPage('sketch', 'new');
            }}
          />
          <br />
          <input
            type="button"
            id="newPage"
            value="Clone Page"
            onClick={() => {
              checkGraph();
              window.TOOLS.insertPage('sketch', 'clone');
            }}
          />
          <br />
          <input
            type="button"
            id="deletePage"
            value="Delete Page"
            onClick={() => {
              checkGraph();

              window.TOOLS.deletePage('sketch');
            }}
          />
          <br />

          <input
            type="button"
            className="debug"
            value="Check Graph"
            onClick={(b) => {
              if (window.TOOLS.checkSketchGraph('sketch', 'verbose,topology')) {
                b.style.removeProperty('border');
              } else $(b).css('border', 'solid 4px red');
            }}
          />
          <br />
          <div className="uLeftSub">
            <ul id="uToolList"></ul>
          </div>
        </div>
        <div id="uPrefToggle">Sketch Prefs 🔽</div>
      </div>
    ) : (
      <div>Loading Sketch</div>
    );
  };

  const toolButtons = () => {
    return sketchLoaded ? (
      <div className={classes.LibButtons}>
        <button
          type="button"
          onClick={() => {
            checkGraph();
            window.TOOLS.loadLibraryTools('basic');
          }}
        >
          Basic
        </button>
        {/* <button type="button" onClick="TOOLS.loadLibraryTools('hyperbolic');">Hyperbolic Geometry</button> */}
      </div>
    ) : (
      <div>Loading Tool Buttons</div>
    );
  };

  const resizeSketch = () => {
    window.TOOLS && window.TOOLS.resetSketchWindowSize('sketch');
  };

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
    setFirstTabLoaded();

    console.log('Found sketch: ', $sketch);

    const data = $sketch && $sketch.data('document');
    console.log('Found data: ', data);
    if (data) {
      const sketchWidth = data.metadata.width;
      console.log('Sketch width: ', sketchWidth);
      sketchDoc.current = data;
      sketch = data.focusPage;
      setSketchLoaded(true);
    }
    // checkTools();
  };

  const checkTools = async () => {
    await new Promise((r) => setTimeout(r, 5000));
    if (!TOOLS) {
      console.log('~~~~ No Tools yet! ~~~~~');
      loadTools();
      checkTools();
    } else {
      setSketchLoaded(true);
    }
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
    // shouldLoadWidgets(config);
    console.log('Found config! ', config);
    return config;
  };

  const shouldLoadWidgets = ({ metadata }) => {
    const { authorPreferences } = metadata;
    if (authorPreferences) {
      for (let [key, value] of Object.entries(authorPreferences)) {
        if (key.includes('widget') && value !== 'none') {
          hasWidgets.current = true;
        }
      }
    }
  };

  const loadSketch = () => {
    const { tab } = props;
    const isToolsLoaded = () => {
      return !!(window.UTILMENU && !!window.TOOLS);
    };
    // When should this call happen, before or after loading the sketch?
    console.log('Tools?: ', isToolsLoaded());
    if (isToolsLoaded()) {
      // window.WIDGETS.initWidget();
      // window.PAGENUM.initPageControls();
      // window.UTILMENU.initUtils();
      loadSketchDoc(getSketchConfig(tab));
      window.TOOLS.initLibrary();
      // establish sketch listeners for handlers
      syncToFollower();
    } else {
      const pollDOM = () => {
        console.log(
          'Tools recheck: ',
          window.TOOLS,
          'widgets? ',
          isToolsLoaded()
        );
        if (isToolsLoaded()) {
          loadSketchDoc(getSketchConfig(tab));
          window.TOOLS.initLibrary(); //or loadLibraryTools()
          syncToFollower();
        } else {
          setTimeout(pollDOM, 250); // try again in 150 milliseconds
        }
      };
      pollDOM();
    }
  };
  console.log('Rendered - ', sketchLoaded);

  return (
    <Fragment>
      <div className={classes.Activity}>
        {leftPane()}
        <div className="sketch_container" id="calculatorParent">
          <div
            className="sketch_canvas"
            id="sketch"
            // data-url="/WSPAssets/empty.json"
            // data-url="/WSPAssets/library/basic/tester.json"
            ref={wspSketch}
          />
          <div className="button_area">
            <div className="util-menu-btn util-menu" />
            <div className="wsp_logo" />
            <div className="page_buttons" />
          </div>
        </div>
      </div>
      <div
        id="resize"
        style={{
          position: 'absolute',
          zIndex: 1000,
          height: '15px',
          width: '15px',
          cursor: 'move',
          padding: '0px',
          top: '401px',
          left: '807px',
        }}
      >
        <img alt="resize handler" src="https://via.placeholder.com/30" />
      </div>
      <div>
        <div
          id="toolCollection"
          className={classes.toolCollection}
          style={{ backgroundColor: '#fff' }}
        >
          <div className="uLibDirections">
            Tap a tool to add it to the sketch.
          </div>
          {toolButtons()}
          <div id="toolTable" className={classes.toolTable} />
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
