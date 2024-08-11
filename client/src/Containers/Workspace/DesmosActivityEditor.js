import React, { useState, useRef, useEffect, Fragment } from 'react';
import PropTypes from 'prop-types';
import { API } from 'utils';
import classes from './graph.css';
import { fetchConfigData } from './Tools/DesActivityHelpers';

const DesmosActivityEditor = (props) => {
  const [activityHistory, setActivityHistory] = useState({});
  const editorRef = useRef();
  const editorInst = useRef();

  // trigger variable for any Desmos server response other than 200

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
    API.put('tabs', tab._id, updateObject)
      .then(() => updateActivityTab(activity._id, tab._id, updateObject))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
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

  useEffect(() => {
    initEditor();
    return () => {
      if (editorInst.current && !editorInst.current.isDestroyed()) {
        editorInst.current.destroy();
      }
    };
  }, []);

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
  user: PropTypes.shape({}),
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
};

DesmosActivityEditor.defaultProps = {
  user: undefined,
};

export default DesmosActivityEditor;
