import React, { useRef, useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import WSPIframe from './Tools/WSPIframe'
import testConfig from './Tools/WSPAssets/test.json'
import classes from './graph.css';

const WebSketch = (props) => {
    let initializing = false;
    // const wspIframe = useRef();
    const wspDivWrapper = useRef();

    useEffect(() => {
        initializing = true;
        props.setFirstTabLoaded();
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

            <div
                className={classes.Activity}
                // onClickCapture={_checkForControl}
                id="containerParent"
                style={{
                    height: '890px', // @TODO this needs to be adjusted based on the editor instance.
                }}
            >
                <div
                    ref={wspDivWrapper}
                    // style={{ height: '100%' }}
                    id="container"
                    style={{
                        // pointerEvents: !_hasControl() ? 'none' : 'auto',
                        height: '100%',
                        overflow: 'auto',
                    }}
                >
                    <WSPIframe 
                        style={style}
                        title="wsp">
                        <div className="sketch_container">
                            <div className="sketch_canvas" id="sketch" data-url={testConfig}>
                                Loading...
                            </div>
                            <div className="buttonPane">
                            </div>
                        </div>
                    </WSPIframe>
                    {/* <iframe
            ref={wspIframe}
            style={style}
            title="wsp"
            src={iframeSrc}
          /> */}
                    ;
                </div>
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
