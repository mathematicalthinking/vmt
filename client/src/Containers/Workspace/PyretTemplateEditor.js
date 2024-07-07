import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { usePyret, API } from 'utils';

const PyretTemplateEditor = (props) => {
  const { tab, setFirstTabLoaded, isFirstTabLoaded } = props;
  const { currentStateBase64: initialState } = tab;

  const cpoIframe = useRef();
  const cpoDivWrapper = useRef();

  const onMessage = (data) => {
    console.log('Got a message VMT side', data);
  };

  const { iframeSrc, currentState, isReady } = usePyret(
    cpoIframe,
    onMessage,
    initialState
  );

  useEffect(() => {
    if (!isReady || !currentState) return;
    console.log('saving state', currentState);
    const { _id } = tab;
    const updateObject = {
      currentStateBase64: JSON.stringify(currentState),
    };
    API.put('tabs', _id, updateObject).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
  }, [currentState, isReady]);

  // useEffect(() => {
  //   const { setFirstTabLoaded } = props;
  //   if (isReady) setFirstTabLoaded();
  // }, [isReady]);

  useEffect(() => {
    if (iframeSrc && !isFirstTabLoaded) setFirstTabLoaded();
  }, [iframeSrc, isFirstTabLoaded]);

  const style = {
    width: '100%',
    height: '100%',
  };

  return (
    <div
      ref={cpoDivWrapper}
      id="container"
      style={{
        height: '100%',
        overflow: 'auto',
      }}
    >
      <iframe ref={cpoIframe} style={style} title="pyret" src={iframeSrc} />;
    </div>
  );
};

PyretTemplateEditor.propTypes = {
  tab: PropTypes.shape({}).isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
};

export default PyretTemplateEditor;
