
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import testConfig from './Tools/test.json'
import loadExternals from './Tools/WSPLoader';
import classes from './graph.css';
// import wspjs from './Tools/WSPAssets/wsp'

// TODO - refactor: split to relfect order, then simplify callback
const externals = [
    // {
    //     id: 'jquery',
    //     type: 'js',
    //     url: './WSPAssets/jquery-2.1.0.min'  
    // },
    {
        id: 'wspscript',
        type: 'js',
        url: '/WSPAssets/wsp.js',
        onLoad: () => {
            const remaining = externals.slice(1)
            remaining.forEach((ext) => {
                loadExternals(ext)
            })
        }
    },
    {
        id: 'wsprunner',
        type: 'js',
        url: '/WSPAssets/wsp-runner.js',
        onLoad: () => {
            loadSketch()
        }
    },
    {
        id: 'widgetcss',
        type: 'css',
        url: '/WSPAssets/widgets/widgets.css'
    },
    {
        id: 'widgetsjs',
        type: 'js',
        url: '/WSPAssets/widgets/widgets.js'
    },
    // {
    //     id: 'desTest',
    //     type: 'js',
    //     url: 'https://www.desmos.com/api/v1.5/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6'
    // }

]

const loadSketch = () => {
    const $ = window.jQuery;
    if (!$) {
        console.warn('No jQuerious');
    return
    }
    $('#sketch').WSP("loadSketch", {
        "data-sourceDocument": testConfig
    })
}

const WebSketch = (props) => {
    let initializing = false;
    const wspSketch = useRef();
    const wspDivWrapper = useRef();
    const options = {
        "data-sourceDocument": testConfig
    }
    const { setFirstTabLoaded } = props;
                 
    useEffect(() => {
        initializing = true;

        loadExternals(externals[0])
        setFirstTabLoaded();

        initializing = false;
        return () => {
            // socket.removeAllListeners('RECEIVE_EVENT');
            console.log('WSP activity ending - clean up listeners');
        };
    }, []);

    const style = {
        width: '100%',
        height: '100%',
        // pointerEvents: !_hasControl() ? 'none' : 'auto',
    };

    return (
            <Fragment>
                {!window.jQuery ? (
                    <Script 
                url="https://code.jquery.com/jquery-2.2.4.min.js"
                integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44="
                crossorigin="anonymous"
                onLoad={() => {
                   console.log("jQuery loaded!")
                }
            }
           /> ) : (console.log('jQuery found')) }
                     {/* <div className='sketch_canvas' id='sketch1' data-url='./Tools/test.json'>Loading...</div> */}
                    <div id='sketch'></div>
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
