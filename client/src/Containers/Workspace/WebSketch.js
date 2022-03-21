
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import testConfig from './Tools/test.json'
import WSPLoader from './Tools/WSPLoader';
import socket from '../../utils/sockets';
import mongoIdGenerator from '../../utils/createMongoId';
import ControlWarningModal from './ControlWarningModal';

import classes from './graph.css';

const WebSketch = (props) => {
    const [showControlWarning, setShowControlWarning] = useState(false);
    const [activityUpdates, setActivityUpdates] = useState();

    let initializing = false;
    let receivingData = false;

    let $sketch = null;  // the jquery object for the server's sketch_canvas HTML element
    let sketchDoc = null;    // The WSP document in which the websketch lives.
    let sketch = null;       // The websketch itself, which we'll keep in sync with the server websketch.
    const wspSketch = useRef();
    const { setFirstTabLoaded } = props;

    useEffect(() => {
        initializing = true;
        // load required files and then the sketch when ready
        WSPLoader(loadSketch)
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
    let actionText = 'interacted with the Activity'
    let actionDetailText = '';
    if (updates.action === 'moveGobj') {
        actionText = 'moved a point'
    }
    if (updates.data) {
        actionDetailText = updates.data
    }
    return `${username} ${actionText} ${actionDetailText}`;
  };

// handles a change event when user is in control
  const handleEventData = (updates, type) => {
    if (initializing) return;
    const { room, user, myColor, tab, resetControlTimer } = props;

    if (!receivingData) {
      const description = buildDescription(
        user.username,
        updates
      );
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
      console.log('Data to send: ', newData)
      props.addToLog(newData);
      socket.emit('SEND_EVENT', newData, () => {});
      resetControlTimer();
      // putState();  // save to db?
    }
    receivingData = false;
  };

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
        moveGobj(updatesState)
      } else {
        addNtfToTabs(data.tab);
        receivingData = false;
      }
    });
  }

    const updateHandler = (attr) => {
        setActivityUpdates(attr)
    }

    // sketch event helpers
      function moveGobj(attr) {
        // A point moved: Find the object in the other sketch with the same id, and move it
        // to the same location. Don't send the entire gobj, as it may have circular references
        // (to children that refer to their parents) and thus cannot be stringified.

        if (_hasControl()) {
            const gobj = attr.target;
            const gobjInfo = {id: gobj.id, loc: gobj.geom.loc};
            const gobjData = JSON.stringify(gobjInfo, null, 2)
            // console.log({
            //   action: "moveGobj",
            //   data: gobjData,
            // });

            handleEventData(gobjInfo)
        } else {
            let selector = `#${attr.id}`;
            // console.log("Selector: ", selector, " sQuery? ", !!sketch.sQuery);
            let destGobj = sketch.sQuery(selector)[0];
            destGobj.geom.loc = GSP.GeometricPoint(attr.loc);
            destGobj.invalidateGeom();
        }
      }

    const loadSketch = () => {
        const $ = window.jQuery;
        if (!$) {
            console.warn('No jQuerious');
            return
        }
        $('#sketch').WSP("loadSketch", {
            "data-sourceDocument": testConfig,
            onLoad: function (metadata) {
                console.log("Loading: ", metadata);
                $sketch = $("#sketch");
                setFirstTabLoaded();
                initializeListeners();
            }
        })
        const data = $sketch.data("document")
        console.log('Found data: ', data)
        sketchDoc = data;
        sketch = data.focusPage;
        
        let points = sketch.sQuery('Point[constraint="Free"]');
        points.on("update", updateHandler);
    }

    // interaction helpers

    function _hasControl() {
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
