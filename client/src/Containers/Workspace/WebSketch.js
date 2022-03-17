
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import testConfig from './Tools/test.json'
import WSPLoader from './Tools/WSPLoader';
// import classes from './graph.css';

const WebSketch = (props) => {
    let initializing = false;
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
            // socket.removeAllListeners('RECEIVE_EVENT');
            console.log('WSP activity ending - clean up listeners');
        };
    }, []);

    // sketch event helpers
      function moveGobj(attr) {
        // A point moved: Find the object in the other sketch with the same id, and move it
        // to the same location. Don't send the entire gobj, as it may have circular references
        // (to children that refer to their parents) and thus cannot be stringified.
        let gobj = attr.target;
        let gobjInfo = {id: gobj.id, loc: gobj.geom.loc};
        console.log({
          action: "moveGobj",
          data: JSON.stringify(gobjInfo, null, 2),
        });
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
            }
        })
        const data = $sketch.data("document")
        console.log('Found data: ', data)
        sketchDoc = data;
        sketch = data.focusPage;
        
        let points = sketch.sQuery('Point[constraint="Free"]');
        points.on("update", moveGobj);
    }

    return (
        <Fragment>
            <div id='sketch' ref={wspSketch}></div>
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
