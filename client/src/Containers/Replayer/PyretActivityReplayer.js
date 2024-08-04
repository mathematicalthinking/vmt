import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePyret } from 'utils';

const PyretActivityReplayer = (props) => {
  const { index, log, tab, setTabLoaded, inView } = props;
  const { startingPointBase64: initialState } = tab;
  const cpoIframe = useRef();

  const { iframeSrc, postMessage } = usePyret(
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

  function updatePyret() {
    const pyretMessageString =
      log[index] && log[index].currentState ? log[index].currentState : null;

    const pyretMessage = JSON.parse(pyretMessageString);
    if (pyretMessage) {
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
  log: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  index: PropTypes.number.isRequired,
  tab: PropTypes.shape({}).isRequired,
  setTabLoaded: PropTypes.func.isRequired,
};

export default PyretActivityReplayer;
