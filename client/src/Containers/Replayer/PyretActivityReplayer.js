import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePyret } from 'utils';

const PyretActivityReplayer = (props) => {
  const { index, log, tab, setTabLoaded, inView, setMathState } = props;
  const { startingPointBase64: initialState } = tab;
  const cpoIframe = useRef();

  const { iframeSrc, postMessage, currentState } = usePyret(
    cpoIframe,
    () => {},
    initialState
  );

  // handles the updates to the player

  useEffect(() => {
    if (iframeSrc) setTabLoaded(tab._id);
  }, [iframeSrc]);

  useEffect(() => {
    if (inView) updatePyret();
  }, [index, inView]);

  useEffect(() => {
    setMathState(JSON.stringify(currentState));
  }, [currentState]);

  function updatePyret() {
    const pyretMessageString =
      log[index] && log[index].currentState ? log[index].currentState : null;

    const pyretMessage = JSON.parse(pyretMessageString);
    if (pyretMessage) {
      setMathState(JSON.stringify(pyretMessage.state));
      postMessage(pyretMessage);
    }
  }

  return (
    <div
      id="container"
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      <iframe
        ref={cpoIframe}
        style={{
          height: '100%',
          width: '100%',
        }}
        title="pyret"
        src={iframeSrc}
      />
    </div>
  );
};

PyretActivityReplayer.propTypes = {
  log: PropTypes.arrayOf(PropTypes.shape({ currentState: PropTypes.string }))
    .isRequired,
  index: PropTypes.number.isRequired,
  tab: PropTypes.shape({
    _id: PropTypes.string,
    startingPointBase64: PropTypes.string,
  }).isRequired,
  setTabLoaded: PropTypes.func.isRequired,
  inView: PropTypes.bool.isRequired,
  setMathState: PropTypes.func.isRequired,
};

export default PyretActivityReplayer;
