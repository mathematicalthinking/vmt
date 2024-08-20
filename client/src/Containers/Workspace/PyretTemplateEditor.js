import React, { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { usePyret, API } from 'utils';

const PyretTemplateEditor = (props) => {
  const {
    activity,
    tab,
    setFirstTabLoaded,
    isFirstTabLoaded,
    updateActivityTab,
  } = props;
  const { currentStateBase64 } = tab;

  const [initialState, setInitialState] = useState(currentStateBase64);

  const cpoIframe = useRef();
  const savedStateRef = useRef();

  const onMessage = (data) => {
    console.log('Got a message VMT side', data);
  };

  const { iframeSrc, currentState, isReady } = usePyret(
    cpoIframe,
    onMessage,
    initialState
  );

  useEffect(() => {
    setInitialState(currentStateBase64);
  }, [currentStateBase64]);

  useEffect(
    () => () => {
      if (!savedStateRef.current) return;
      updateActivityTab(activity._id, tab._id, savedStateRef.current);
    },
    []
  );

  useEffect(() => {
    if (!isReady || !currentState) return;
    const { _id } = tab;
    const updateObject = {
      currentStateBase64: JSON.stringify(currentState),
      startingPointBase64: JSON.stringify(currentState),
    };
    savedStateRef.current = updateObject;
    API.put('tabs', _id, updateObject).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
  }, [currentState, isReady]);

  useEffect(() => {
    if (iframeSrc && !isFirstTabLoaded) setFirstTabLoaded();
  }, [iframeSrc, isFirstTabLoaded]);

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
          width: '100%',
          height: '100%',
        }}
        title="pyret"
        src={iframeSrc}
      />
    </div>
  );
};

PyretTemplateEditor.propTypes = {
  activity: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  tab: PropTypes.shape({
    _id: PropTypes.string,
    startingPointBase64: PropTypes.string,
    currentStateBase64: PropTypes.string,
  }).isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  isFirstTabLoaded: PropTypes.bool.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default PyretTemplateEditor;
