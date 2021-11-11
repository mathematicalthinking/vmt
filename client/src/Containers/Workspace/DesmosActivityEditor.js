/* eslint-disable react/prop-types */
/* eslint-disable no-console */
import React, { useState, useRef, useEffect, Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import classes from './graph.css';
import { ActivityEditor } from '../../external/js/editor.es';
import {
  activityMetadataSchema,
  screenMetadataSchema,
  componentMetadataSchema,
} from './Tools/DesActivityHelpers.es';
// import API from '../../utils/apiRequests';

const DesmosActivityEditor = (props) => {
  const [activityHistory, setActivityHistory] = useState({});
  const editorRef = useRef();
  const editorInst = useRef();

  let initializing = false;
  // trigger variable for any Desmos server response other than 200
  let configResponse;

  //   const { history } = props;
  //   const handleOnErrorClick = () => history.goBack();

  const putState = () => {
    const { tab } = props;
    // const { _id } = tab;
    let responseData = {};
    if (tab.currentStateBase64) {
      responseData = JSON.parse(tab.currentStateBase64);
    }
    // eslint-disable-next-line array-callback-return
    // Object.entries(activityHistory).map(([key, value]) => {
    //   responseData[key] = [value];
    // });

    responseData = { ...responseData, ...activityHistory };

    const updateObject = {
      currentStateBase64: JSON.stringify(responseData),
    };
    console.log('Update object to save: ', updateObject);
    // if (editorInst.current) {
    //   updateObject.currentScreen = getCurrentScreen();
    // }
    // // console.log('Update object: ', updateObject, 'Temp: ', temp);
    // API.put('tabs', _id, updateObject)
    //   .then(() => (temp ? {} : updateRoomTab(room._id, _id, updateObject)))
    //   .catch((err) => {
    //     // eslint-disable-next-line no-console
    //     console.log(err);
    //   });
  };

  const fetchData = async () => {
    const { tab } = props;
    const code =
      tab.desmosLink ||
      // fallback to turtle time trials, used for demo
      '5da9e2174769ea65a6413c93';
    const URL = `https://teacher.desmos.com/activitybuilder/export/${code}`;
    // console.log('adapted activity url: ', URL);
    // calling Desmos to get activity config
    try {
      const result = await fetch(URL, {
        headers: { Accept: 'application/json' },
      });
      // console.log('Result: ', result);
      // TODO handle this error message
      const status = await result.status;
      if (status !== 200) {
        // any denied respose sets the trigger
        configResponse = status;
        return null;
      }
      const data = await result.json();
      return data;
    } catch (err) {
      console.log('Initalization fetch error: ', err);
      return null;
    }
  };

  const initEditor = async () => {
    const { tab, setFirstTabLoaded } = props;
    const editorOptions = {
      activityConfig: await fetchData(),
      targetElement: editorRef.current,
      customMetadataConfig: {
        schemas: {
          activity: activityMetadataSchema,
          screen: screenMetadataSchema,
          component: componentMetadataSchema,
        },
        key: tab._id,
      },
      onError: (err) => {
        console.error(
          err.message ? err : `EditorAPI error: ${JSON.stringify(err, null, 2)}`
        );
      },
      // callback to handle persistent state
      onConfigurationUpdated: (responses) => {
        // milisecond timeout to ensure transient events are sent prior to persistent
        console.log('New updates: ', responses);
        setActivityHistory((oldState) => ({ ...oldState, ...responses }));
      },
    };
    // if (tab.currentStateBase64) {
    //   const { currentStateBase64 } = tab;
    //   const savedData = JSON.parse(currentStateBase64);
    //   // console.log('Prior state data loaded: ');
    //   // console.log(savedData);
    //   playerOptions.responseData = savedData;
    // }

    try {
      editorInst.current = new ActivityEditor(editorOptions);
    } catch (err) {
      console.log('Editor initialization error: ', err);
      initializing = false;
      setFirstTabLoaded();
      return null;
    }

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
        putState();
        if (!editorInst.current.isDestroyed()) editorInst.current.destroy();
      }
    };
  }, []);

  return (
    <Fragment>
      {console.log(
        'init: ',
        initializing,
        ' Config response: ',
        configResponse
      )}
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
  room: PropTypes.shape({}).isRequired,
  tab: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  // referencing: PropTypes.bool.isRequired,
  // updateUserSettings: PropTypes.func,
};

DesmosActivityEditor.defaultProps = {};

export default withRouter(DesmosActivityEditor);
