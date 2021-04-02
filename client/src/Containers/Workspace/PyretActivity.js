import React, { useState, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import ControlWarningModal from './ControlWarningModal';

function PyretAPI(iframeReference, onmessageHandler) {
  let messageNumber = 0;
  const oldOnMessage = window.onmessage;
  const handlers = {
    onmessage: onmessageHandler,
    postMessage,
  };
  function postMessage(data) {
    messageNumber += 1;
    iframeReference().contentWindow.postMessage(
      {
        protocol: 'pyret',
        messageNumber,
        timestamp: window.performance.now(),
        data,
      },
      '*'
    );
  }
  window.onmessage = function(event) {
    if (event.data.protocol !== 'pyret') {
      console.log('Not a pyret');
      if (typeof oldOnMessage === 'function') {
        return oldOnMessage(event);
      }
    }
    return handlers.onmessage(event.data);
  };
  return handlers;
}

const CodePyretOrg = (props) => {
  const [showControlWarning, setShowControlWarning] = useState(false);
  useEffect(() => {
    props.setFirstTabLoaded();
  }, []);

  function _hasControl() {
    return props.inControl === 'ME';
  }
  function _checkForControl(event) {
    if (!_hasControl()) {
      event.preventDefault();
      setShowControlWarning(true);
    }
  }

  const style = { width: '100%', height: '100%' };
  const { inControl, user } = props;

  const iframeRef = React.createRef();
  const onMessage = function(data) {
    console.log('Got a message VMT side', data);
  };

  const pyret = PyretAPI(function() {
    return iframeRef.current;
  }, onMessage);
  window.tryItOut = function() {
    const change = {
      from: { line: 0, ch: 0 },
      to: { line: 0, ch: 0 },
      text: ['Startup'],
    };
    pyret.postMessage({ type: 'change', change });
  };
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
        inAdminMode={user.inAdminMode}
      />

      <div
        style={{ height: '100%' }}
        id="container"
        onClickCapture={_checkForControl}
      >
        <iframe
          ref={iframeRef}
          style={style}
          title="pyret"
          src="http://localhost:5000/editor"
        />
        ;
      </div>
    </Fragment>
  );
};

CodePyretOrg.propTypes = {
  user: PropTypes.shape({}).isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
};

export default CodePyretOrg;
