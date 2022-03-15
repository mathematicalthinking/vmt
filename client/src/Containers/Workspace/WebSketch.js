import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import classes from './graph.css';

const WebSketch = (props) => {
    let initializing = false;

    useEffect(() => {
        initializing = true;
        props.setFirstTabLoaded();
        initializing = false;
        return () => {
          window.onmessage = oldOnMessage;
          socket.removeAllListeners('RECEIVE_EVENT');
          console.log('CPO activity ending - clean up listeners');
        };
      }, []);

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
        //   ref={cpoDivWrapper}
          // style={{ height: '100%' }}
          id="container"
          style={{
            // pointerEvents: !_hasControl() ? 'none' : 'auto',
            height: '100%',
            overflow: 'auto',
          }}
        >
            <div>
                WEBSKETCH THINGY GOES HERE
            </div>
          {/* <iframe
            ref={cpoIframe}
            style={style}
            title="pyret"
            src={iframeSrc} // "http://localhost:5000/editor"
          /> */}
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
