import React, { useState, useRef, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { API } from 'utils';
import classes from './graph.css';
import { fetchConfigData } from './Tools/DesActivityHelpers';

const DesmosActivityEditor = (props) => {
  const [activityHistory, setActivityHistory] = useState({});
  const editorRef = useRef();
  const editorInst = useRef();

  useEffect(() => {
    return () => {
      if (editorInst.current) {
        editorInst.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    const initializeEditor = async () => {
      if (editorInst.current) {
        editorInst.current.destroy();
      }
      await initEditor();
    };

    initializeEditor();
  }, [props.tab.desmosLink]);

  useEffect(() => {
    putState();
  }, [activityHistory]);

  const putState = (config) => {
    const { tab, activity, updateActivityTab } = props;
    let configData = {};
    // startingPointBase64 is the latest config state of the template
    if (tab.startingPointBase64) {
      configData = JSON.parse(tab.startingPointBase64);
    }

    configData = { ...configData, ...activityHistory };

    const updateObject = {
      startingPointBase64: JSON.stringify(configData),
    };
    if (config) {
      updateObject.currentStateBase64 = JSON.stringify(config);
    }
    updateActivityTab(activity._id, tab._id, updateObject);
  };

  const initEditor = async () => {
    const { tab, setFirstTabLoaded } = props;
    const { config } = await fetchConfigData(tab);
    const { ActivityEditor } = await import('../../external/js/editor.es');
    const editorOptions = {
      activityConfig: config,
      targetElement: editorRef.current,
      onError: (err) => {
        console.error(
          err.message ? err : `EditorAPI error: ${JSON.stringify(err, null, 2)}`
        );
      },
      // callback to handle persistent state
      onConfigurationUpdated: (responses) => {
        setActivityHistory((oldState) => ({ ...oldState, ...responses }));
      },
    };
    if (config) {
      // save configuration at load, could implement reset of current edits
      putState(config);
    }

    try {
      editorInst.current = new ActivityEditor(editorOptions);
    } catch (err) {
      console.log('Editor initialization error: ', err);
      return null;
    }
    console.log(
      'Desmos Activity Editor initialized Version: ',
      ActivityEditor.version(),
      'Editor instance: ',
      editorInst.current
    );
    setFirstTabLoaded();
    // Go to screen last used
    return null;
  };

  return (
    <Fragment>
      <div
        className={classes.Activity}
        id="editorParent"
        style={{
          height: '890px', // @TODO this needs to be adjusted based on the Player instance.
        }}
      >
        <div
          className={classes.Graph}
          id="editor"
          ref={editorRef}
          style={{
            overflow: 'auto',
          }}
        />
      </div>
    </Fragment>
  );
};

DesmosActivityEditor.propTypes = {
  activity: PropTypes.shape({ _id: PropTypes.string }).isRequired,
  tab: PropTypes.shape({
    startingPointBase64: PropTypes.string,
    _id: PropTypes.string,
  }).isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

export default DesmosActivityEditor;
