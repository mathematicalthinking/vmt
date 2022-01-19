/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useState, useRef, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classes from './graph.css';
// import { ActivityEditor } from '../../external/js/editor.es';

import {
  fetchConfigData,
  // activityMetadataSchema,
  // screenMetadataSchema,
  // componentMetadataSchema,
} from './Tools/DesActivityHelpers';
import API from '../../utils/apiRequests';

const DesmosActivityEditor = (props) => {
  const [activityHistory, setActivityHistory] = useState({});
  const editorRef = useRef();
  const editorInst = useRef();

  let initializing = false;
  // trigger variable for any Desmos server response other than 200
  // let configResponse;

  useEffect(() => {
    putState();
  }, [activityHistory]);

  const putState = (config) => {
    const { tab, activity, updateActivityTab } = props;
    // const { _id } = tab;
    let configData = {};
    // startingPointBase64 is the latest config state of the template
    if (tab.startingPointBase64) {
      configData = JSON.parse(tab.startingPointBase64);
    }
    // eslint-disable-next-line array-callback-return
    // Object.entries(activityHistory).map(([key, value]) => {
    //   configData[key] = [value];
    // });

    configData = { ...configData, ...activityHistory };

    const updateObject = {
      startingPointBase64: JSON.stringify(configData),
    };
    if (config) {
      updateObject.currentStateBase64 = JSON.stringify(config);
    }
    // console.log('Update object: ', updateObject);
    API.put('tabs', tab._id, updateObject)
      .then(() => updateActivityTab(activity._id, tab._id, updateObject))
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  const initEditor = async () => {
    const { tab, setFirstTabLoaded } = props;
    const { config, status } = await fetchConfigData(tab);
    const { ActivityEditor } = await import('../../external/js/editor.es');
    const editorOptions = {
      activityConfig: config,
      targetElement: editorRef.current,
      // customMetadataConfig: {
      //   schemas: {
      //     activity: activityMetadataSchema,
      //     screen: screenMetadataSchema,
      //     component: componentMetadataSchema,
      //   },
      //   key: tab._id,
      // },
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
    console.log('Config status: ', status);
    if (config) {
      // save configuration at load, could implement reset of current edits
      console.log('Saving this initial session configuration to tab...');
      putState(config);
    }

    try {
      editorInst.current = new ActivityEditor(editorOptions);
    } catch (err) {
      console.log('Editor initialization error: ', err);
      // window.location.reload();
      return null;
    }
    console.log('Initializing: ', initializing);
    console.log(
      'Desmos Activity Editor initialized Version: ',
      ActivityEditor.version(),
      'Editor instance: ',
      editorInst.current
    );
    setFirstTabLoaded();
    // Print current Tab data
    // console.log('Tab data: ', props.tab);
    // Go to screen last used
    return null;
  };

  useEffect(() => {
    initializing = true;
    initEditor();
    initializing = false;
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
  activity: PropTypes.shape({}).isRequired,
  tab: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}),
  setFirstTabLoaded: PropTypes.func.isRequired,
  updateActivityTab: PropTypes.func.isRequired,
  // referencing: PropTypes.bool.isRequired,
  // updateUserSettings: PropTypes.func,
};

DesmosActivityEditor.defaultProps = {
  user: undefined,
};

export default withRouter(DesmosActivityEditor);
