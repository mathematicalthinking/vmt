
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import testConfig from './Tools/test.json'
import WSPLoader from './Tools/WSPLoader';
// import classes from './graph.css';

const WebSketch = (props) => {
    let initializing = false;
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
                setFirstTabLoaded();
            }
        })
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
