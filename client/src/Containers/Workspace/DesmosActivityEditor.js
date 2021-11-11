/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useState, useRef, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classes from './graph.css';
import { ActivityEditor } from '../../external/js/editor.es';
import {
  fetchConfigData,
  // activityMetadataSchema,
  // screenMetadataSchema,
  // componentMetadataSchema,
} from './Tools/DesActivityHelpers.es';
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
      updateObject.startingPointBase64 = JSON.stringify(config);
      // simply put truthy value to trigger config response on reload
      updateObject.currentStateBase64 = true;
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

    if (!tab.startingPointBase64 || tab.startingPointBase64 === '{}') {
      // first load or no events, save configuration
      console.log('Saving this initial configuration to tab');
      putState(config);
    }

    try {
      editorInst.current = new ActivityEditor(editorOptions);
    } catch (err) {
      console.log('Editor initialization error: ', err);
      initializing = false;
      setFirstTabLoaded();
      return null;
    }
    console.log('Initializing: ', initializing);
    console.log(
      'Desmos Activity Editor initialized Version: ',
      ActivityEditor.version(),
      'Editor instance: ',
      editorInst.current
    );
    props.setFirstTabLoaded();
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
      if (editorInst.current) {
        // if (!editorInst.current.isDestroyed()) editorInst.current.destroy();
      }
    };
  }, []);

  return (
    <Fragment>
      {/* <div
        id="activityNavigation"
        className={classes.ActivityNav}
        onClickCapture={_checkForControl}
        style={{
          pointerEvents: !_hasControl() ? 'none' : 'auto',
        }}
      >
        {_hasControl() && backBtn && (
          <Button theme="Small" id="nav-left" click={() => navigateBy(-1)}>
            Prev
          </Button>
        )}
        <span
          title="Navigation buttons only seen when in control"
          id="show-screen"
          className={classes.Title}
        >
          <div>Screen {getCurrentScreen() + 1}</div>
          <div id="screen-count" className={classes.Screens}>
            of {getScreenCount()}
          </div>
        </span>
        {_hasControl() && fwdBtn && (
          <Button theme="Small" id="nav-right" click={() => navigateBy(1)}>
            Next
          </Button>
        )}
      </div> */}
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
