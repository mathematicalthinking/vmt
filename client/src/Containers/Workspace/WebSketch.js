
import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import Script from 'react-load-script';
import testConfig from './Tools/WSPAssets/test.json'
import loadExternals from './Tools/WSPLoader';
import classes from './graph.css';

const externals = [
    // {
    //     id: 'jquery',
    //     type: 'js',
    //     file: './WSPAssets/jquery-2.1.0.min'  
    // },
    {
        id: 'wspscript',
        type: 'js',
        file: './WSPAssets/wsp.js'
    },
    {
        id: 'wsprunner',
        type: 'js',
        file: './WSPAssets/wsp-runner.js'
    },
    {
        id: 'widgetcss',
        type: 'css',
        file: './WSPAssets/widgets/widgets.css'
    },
    {
        id: 'widgetsjs',
        type: 'js',
        file: './WSPAssets/widgets/widgets.js'
    },

]

const WebSketch = (props) => {
    let initializing = false;
    const wspSketch = useRef();
    const wspDivWrapper = useRef();
    const options = {
        "data-sourceDocument": testConfig
    }

    useEffect(() => {
        initializing = true;

        // $el.WSP("loadSketch", options)

        // props.setFirstTabLoaded();
        externals.forEach( ext => {
            loadExternals(ext)
        })
        
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
                    const { setFirstTabLoaded } = props;
                 
                        setFirstTabLoaded();
                
                }
            }
           /> ) : (console.log('jQuery found')) }
                 {/* {externals.map((ext) => {
                    return ( <Script
                    url= {ext.file}
                    onLoad={() => {
                        console.log('Loaded ', ext.id)
                    }}
                    attributes={{ id: ext.id }}
                    /> )
                })} */}
                <div
                    className={classes.Graph}
                    id="sketch1"
                    ref={wspSketch}
                >
                    WSP THINGAMABOB HERE
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
