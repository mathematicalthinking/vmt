import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePyret } from 'utils';

const PyretActivityReplayer = (props) => {
  const { index, log, tab, setTabLoaded } = props;
  const cpoIframe = useRef();
  const cpoDivWrapper = useRef();

  const { iframeSrc, postMessage } = usePyret(cpoIframe);

  // handles the updates to the player

  useEffect(() => {
    setTabLoaded(tab._id);
  }, []);

  // useEffect(() => {
  //  if (isReady) setTabLoaded(tab._id)
  // }, [isReady])

  useEffect(() => {
    updatePlayer();
  }, [index]);

  function updatePlayer() {
    // Take updated player data with new Player state to update
    const currentState =
      log[index] && log[index].currentState ? log[index].currentState : null;

    const pyretMessage = JSON.parse(currentState);
    if (pyretMessage) {
      postMessage(pyretMessage);
    }
  }

  return (
    <div
      ref={cpoDivWrapper}
      // style={{ height: '100%' }}
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
