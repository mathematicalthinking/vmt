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
import WSPLoader from './Tools/WSPLoader';
import socket from '../../utils/sockets';
import API from '../../utils/apiRequests';

import classes from './WebSketchEditor.css';

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
    WSPLoader(loadSketch, true);
    initializing = false;
    return () => {
      socket.removeAllListeners('RECEIVE_EVENT');
      // window.UTILMENU = undefined;
      // do we need to unmount or destroy the wsp instance?
      console.log('WSP activity ending - clean up listeners');
    };
  }, []);

  // Handle new Events- escapes initialization scope
  // useEffect(() => {
  //   recordGobjUpdate(activityUpdates);
  // }, [activityUpdates]);

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

  // --- Initialization functions ---
  const resizeSketch = () => {
    window.TOOLS && window.TOOLS.resetSketchWindowSize('libSketch');
  };

  const loadSketchDoc = (config) => {
    $ = window.jQuery;
    if (!$) {
      console.warn('No jQuerious');
      return;
    }
    $('#libSketch').WSP('loadSketch', {
      'data-sourceDocument': config,
      onLoad: (metadata) => {
        console.log('Loading: ', metadata);
        $sketch = $('#libSketch');
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
      sketchDoc = data;
      sketch = data.focusPage;
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
    console.log('Found config! ', config);
    return config;
  };

  const loadSketch = () => {
    const { tab } = props;

    // When should this call happen, before or after loading the sketch?
    let isWidgetLoaded =
      window.UTILMENU && !!window.UTILMENU.initUtils && window.TOOLS;
    console.log('Widgets?: ', isWidgetLoaded);
    if (isWidgetLoaded) {
      window.WIDGETS.initWidget();
      window.PAGENUM.initPageControls();
      window.UTILMENU.initUtils();
      loadSketchDoc(getSketchConfig(tab));
    } else {
      const pollDOM = () => {
        isWidgetLoaded =
          window.UTILMENU && !!window.UTILMENU.initUtils && window.TOOLS;
        console.log('Widgets recheck: ', isWidgetLoaded);
        if (isWidgetLoaded) {
          loadSketchDoc(getSketchConfig(tab));
        } else {
          setTimeout(pollDOM, 100); // try again in 100 milliseconds
        }
      };
      pollDOM();
    }
  };

  return (
    <Fragment>
      <div className={classes.Activity}>
        <div className={classes.leftPane}>
          <div>
            <label for="height">Height</label>
            <input
              type="number"
              id="height"
              class="uSizeButton"
              name="height"
              min="50"
              max="2000"
              onChange={
                () => resizeSketch()
                // window.TOOLS && window.TOOLS.resetSketchWindowSize('libSketch')
              }
            ></input>
          </div>
          <div>
            <label for="width">Width</label>
            <input
              type="number"
              id="width"
              class="uSizeButton"
              name="width"
              min="50"
              max="2000"
              onChange={
                () => resizeSketch()
                // window.TOOLS && window.TOOLS.resetSketchWindowSize('libSketch')
              }
            ></input>
          </div>
          <div id="uPagePane" class="uLeftSub">
            <input
              type="button"
              id="newPage"
              value="New Page"
              onClick={() => window.TOOLS.insertPage('libSketch', 'new')}
            />
            <br />
            <input
              type="button"
              id="newPage"
              value="Clone Page"
              onClick={() => window.TOOLS.insertPage('libSketch', 'clone')}
            />
            <br />
            <input
              type="button"
              id="deletePage"
              value="Delete Page"
              onClick={() => window.TOOLS.deletePage('libSketch')}
            />
          </div>
        </div>
        <div className="sketch_container" id="calculatorParent">
          <div
            className="sketch_canvas"
            id="libSketch"
            data-url="empty.json"
            ref={wspSketch}
          />
          <div className="button_area">
            <img
              class="util-menu"
              src="https://geometricfunctions.org/includes/v4.6/widgets/utility-icon.png"
              // onClick={window.UTILMENU && window.UTILMENU.menuBtnClicked(this)}
            />
            <div className="wsp_logo" />
            <div className="page_buttons" />
            <button
              class="widget_button"
              // onClick={window.WIDGETS && window.WIDGETS.toggleWidgets(this)}
            >
              Widgets
            </button>
          </div>
        </div>
      </div>
      <div
        id="resize"
        // style="position: absolute; z-index: 1000; height: 15px; width: 15px; cursor: move; padding: 0px; top: 684px; left: 1239px;"
      >
        <img src="https://via.placeholder.com/30" />
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
