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
  const [sketchLoaded, setSketchLoaded] = useState(false);

  let initializing = false;
  let $sketch = null; // the jquery object for the server's sketch_canvas HTML element
  // let sketchDoc = null; // The WSP document in which the websketch lives.
  let sketch = null; // The websketch itself, which we'll keep in sync with the server websketch.
  const wspSketch = useRef();
  const sketchDoc = useRef(null);
  // const calculatorInst = useRef();
  // const pendingUpdate = React.createRef(null);
  let $ = window ? window.jQuery : undefined;
  const { setFirstTabLoaded } = props;

  useEffect(() => {
    initializing = true;
    setSketchLoaded(false);
    // load required files and then the sketch when ready
    WSPLoader(loadSketch, true);
    initializing = false;
    fetchTools();
    console.log('~~ Page loaded!  ~~');
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
  async function fetchTools() {
    fetch(
      'https://geometricfunctions.org/fc/tools/library/basic/',
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
      .then((html) => {
        console.log('HTML: ', html);
        // Initialize the DOM parser
        const parser = new DOMParser();

        // Parse the text
        const doc = parser.parseFromString(html, 'text/html');

        // You can now even select part of that html as you would in the regular DOM
        // Example:
        // var docArticle = doc.querySelector('article').innerHTML;

        console.log(doc);
      })
      .catch(function(err) {
        console.log('Failed to fetch page: ', err);
      });
  }

  function putState() {
    const { tab, activity, updateActivityTab } = props;
    if (!sketchDoc.current) {
      // console.log('Setting sketc doc');
      const sketchEl = window.jQuery('#libSketch');
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
        $('#libSketch').data('document'),
        ' vs ',
        sketchDoc.current
      );
      if (!$('#libSketch').data('document')) {
        $('#libSketch').data('document', sketchDoc.current);
        console.log('How about now? ', $('#libSketch').data('document'));
      }
      // if (!!window.TOOLS) {
      //   window.TOOLS.initLibrary();
      // }
      // console.log(
      //   'After reloading library? ',
      //   sketchDoc.current,
      //   ' sketch: ',
      //   $('#libSketch').data('document')
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
                window.TOOLS && window.TOOLS.resetSketchWindowSize('libSketch');
              }
              // window.TOOLS && window.TOOLS.resetSketchWindowSize('libSketch')
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
                window.TOOLS && window.TOOLS.resetSketchWindowSize('libSketch');
              }
              // window.TOOLS && window.TOOLS.resetSketchWindowSize('libSketch')
            }
          ></input>
        </div>
        <div id="uPagePane" className="uLeftSub">
          <input
            type="button"
            id="newPage"
            value="New Page"
            onClick={() => {
              checkGraph();
              window.TOOLS.insertPage('libSketch', 'new');
            }}
          />
          <br />
          <input
            type="button"
            id="newPage"
            value="Clone Page"
            onClick={() => {
              checkGraph();
              window.TOOLS.insertPage('libSketch', 'clone');
            }}
          />
          <br />
          <input
            type="button"
            id="deletePage"
            value="Delete Page"
            onClick={() => {
              checkGraph();

              window.TOOLS.deletePage('libSketch');
            }}
          />
          <br />
          <div>Trash Can</div>
          <input
            type="button"
            className="debug"
            value="Check Graph"
            onClick={(b) => {
              if (
                window.TOOLS.checkSketchGraph('libSketch', 'verbose,topology')
              ) {
                b.style.removeProperty('border');
              } else $(b).css('border', 'solid 4px red');
            }}
          />
          <br />
          <div id="uPrefToggle">Sketch Prefs 🔽</div>
          <div id="uPrefDiv">
            <ul id="uPrefList">
              <li>deletewidget: </li>
            </ul>
          </div>
        </div>
      </div>
    ) : (
      <div>Loading Sketch</div>
    );
  };

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
      sketchDoc.current = data;
      sketch = data.focusPage;
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
  console.log('Rendered - ', sketchLoaded);

  return (
    <Fragment>
      <div className={classes.Activity}>
        {leftPane()}
        <div className="sketch_container" id="calculatorParent">
          <div
            className="sketch_canvas"
            id="libSketch"
            // data-url="empty.json"
            ref={wspSketch}
          />
          <div className="button_area">
            <img
              className="util-menu"
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
        <div id="toolCollection" style={{ backgroundColor: '#fff' }}>
          <div className="uLibDirections">
            Tap a tool to add it to the sketch.
          </div>
          <div className="uLibButtons">
            <button
              type="button"
              onClick={() => window.TOOLS.loadLibraryTools('basic/*.json')}
            >
              Basic
            </button>{' '}
            {/* <button type="button" onclick="TOOLS.loadLibraryTools('hyperbolic/*.json');">Hyperbolic Geometry</button>&nbsp; */}
          </div>
          <div id="toolTableMock">
            <span>Tools</span>

            <div
              className="toolItem firstToolItem"
              onClick={() => window.TOOLS.insertToolInSketch('libSketch', 76)}
            >
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFUAAAA/CAYAAACRmoRmAAAAAXNSR0IArs4c6QAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAVaADAAQAAAABAAAAPwAAAAD95GJlAAAFHElEQVR4Ae2Za2hcRRTHz73Z3ex7N/sIpVJIFWqiacX6JC9oG0GLmkI+1EQhbTWCX4rUgCAUoUitoCYhomBIqSIawbQfJFGktSZNrGaTYrUSN7Wk9ZGYNJvdpJt97/6de5Os2ZDQVkS2yTnLcGfOzJ0985szd869Q8TCBJgAE2ACTIAJMAEmwASYABNgAkyACTABJsAEmAATYAJMgAkwASbABJgAE2ACTIAJMAEmwASYABNgAtKtgMDv90MkysvLU9ItYXPWch0ZGUFtzW4UuJzINxmwwW5D/Z46eL1eZK3R2WzYRe8wthQVYofVgk+1GgzIMk5oZFTYLNhaVMRg/83kPb93D+43mRAgQlImQCupaVzkyy1m7Ntbx956M2B9Pp+61D+TtRDk0kCVvAJY8VjlUTA1NZWVYDU3M9j/q20gEKBYIkEFlCTSLtqXRF4WRmwQ6lgiRUq7bBTFxqwTW56djAYD/aoT5iV0GfalklD1Br1OjQYyKrOkkJVQTQYjVeyopBatgSIUy0A1Iyxu1RmovLKSw6sMMjdQUMKpzYV3osxqRXuuXt39O/SyunndU1gIpf4GuuEmSwmMjFxC3VO183GqWd2clKhgeHg4q4Eu2gWWDil7yko0oGxKdruDnE5+o8qemWFLmAATYAJMgAkwASbABJjAGieQ8UYVD80imoL4gAmSJFEFDZkt+ow2y/FCLAxJZ7huu+XuXdW6qK8PL653w+nKR36+ktbB7SxDwwfdmIzEVnzXRiKEC+9sw/bmAYTiYkZWkETCjzMfHcPQrPLdeY1IZLIXuwwP4L1vzuHHwXMYHOjH6Y+PwGZ3YF/XxTSIaPAagsEgwotAT57/Cl8OTqhtouGIep29FhTtQun7AhOn4LKX4JQvmtaterQh4am7LDtxNpzpSUdLrCh+24OZcAwT3e+jRpxqWq12FNc3oWdsDqD3xCG81DGESPRnHK7Zj9a2Q6hwOmHJfQgH289jOjiK488WQCdLcLhfRs/Eyp6/qkBHJvtQbXwUn/8xg2l/AAH/VVz5tg1b9TYc6LyEsb5GGI1m1B/rxdCFbjTu3AizfBCXoyEMtmzB5sZ+hPweVJMMh+NptPd5cPZog3rPh0N+XD7ThlLdg3i3ZwhTscTa8NaIrxsvmKywudxwu91wuVxwCm9bX9WI70en8EPLIzBVtsIfnwMyfeULlBqteGPQj4Hm7birqR+zMx7s1hlxoOt39fmaDPejWm/Eq/2jCPi+Q5XpMfQGM1fCqvLM+cGkD/5SpKFxbKLDnzTTffokpVJEsnkdbbp7I9nEkcYvUoLs24opT6tRd3m9xUS3U5jiqYSIFohyRFLOZoIi43AYyagVaz3sQUTKIS1JJIk9TAOJ1oKLpqHKymjhpntLS+hhoxJP/SOIzyIpIMeGx9LKVFKiacpRfwtKNQwTk5NDiTmVoA0xOwpMQVXV5WTlqdjCCP6ba8YQlfg0Pjf2jN4lrUnKLy6n+PEaeuukF2N/DqGr6RU6LT9DTxQZKUfMgfBX4bHCw5Nx5WB5ToRe6VONe4Ue0kn6uvsnGg2JI9FVLGlPJbFM9XaD8LLlxV2ynzrfHKeq2jI6Apn0ujJ6vfM1KswFeXP1lJcUXckausNhJ6tuvhcpV5StZM7VkMZyG1U96aaG5x4n6vAs/yerURsKhq/rQf6JMfw29hemZubCKYVDSkQACzyUOHYhr1wXlxPhIK5O+DPqF7flPBNgAkyACTCBpQT+BpcuZFfqrtQsAAAAAElFTkSuQmCC"
                alt="Tool-76"
              />
            </div>
          </div>
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
