import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import PropTypes from 'prop-types';
import ControlWarningModal from './ControlWarningModal';
import { usePyret, socket, API } from 'utils';
import classes from './graph.css';

const CodePyretOrg = (props) => {
  const { tab, inControl, user, setFirstTabLoaded, isFirstTabLoaded } = props;
  const { currentStateBase64: initialState } = tab;

  const [showControlWarning, setShowControlWarning] = useState(false);

  const cpoIframe = useRef();

  // useCallback prevents closure on _hasControl (specific to how
  // onMessage is used in usePyret).

  const onMessage = useCallback(
    (data) => {
      console.log('Got a message VMT side', data);
      if (_hasControl()) {
        handleResponseData(data);
      }
    },
    [inControl]
  );

  const {
    iframeSrc,
    postMessage,
    currentState,
    hasControlViolation,
    resetViolation,
  } = usePyret(cpoIframe, onMessage, initialState);

  useEffect(() => {
    socket.on('RECEIVE_EVENT', handleReceiveEvent);
    return () => {
      socket.removeEventListener('RECEIVE_EVENT', handleReceiveEvent);
      console.log('CPO activity ending - clean up listeners');
    };
  }, []);

  // communicating to Pyret Editor about control state
  useEffect(() => {
    if (isFirstTabLoaded) {
      // states: ['gainControl', 'loseControl']
      // VMT states: ['ME', 'NONE', 'OTHER']
      if (inControl === 'ME') {
        postMessage({ type: 'gainControl' });
        console.log('gained Control!');
        _resetWarning();
      } else {
        postMessage({ type: 'loseControl' });
        console.log('lost Control!');
      }
    }
  }, [inControl, isFirstTabLoaded]);

  useEffect(() => {
    if (!currentState) return;
    const { _id } = tab;
    const updateObject = {
      currentStateBase64: JSON.stringify(currentState),
    };
    API.put('tabs', _id, updateObject).catch((err) => {
      // eslint-disable-next-line no-console
      console.log(err);
    });
  }, [currentState]);

  useEffect(() => {
    if (hasControlViolation) setShowControlWarning(true);
  }, [hasControlViolation]);

  useEffect(() => {
    if (iframeSrc && !isFirstTabLoaded) setFirstTabLoaded();
  }, [iframeSrc, isFirstTabLoaded]);

  const handleResponseData = (pyretMessage) => {
    console.log('Response data processing: ', pyretMessage);
    const { emitEvent } = props;

    const description = `${user.username}: ${pyretMessage.description ||
      'Updated the program'}`;

    const pyretMessageString = JSON.stringify(pyretMessage);
    const newData = {
      currentState: pyretMessageString, // use the currentState field on Event model
      description,
    };
    emitEvent(newData);
    console.log('Sent event... ', newData);
  };

  const handleReceiveEvent = (data) => {
    const { updatedRoom, addNtfToTabs, addToLog } = props;
    console.log('Socket: Received data: ', data);
    addToLog(data);
    const { room } = props;
    if (data.tab === tab._id) {
      const updatedTabs = room.tabs.map((t) => {
        if (t._id === data.tab) {
          t.currentState = data.currentState;
        }
        return tab;
      });
      updatedRoom(room._id, { tabs: updatedTabs });
      const pyretMessage = JSON.parse(data.currentState);
      // Relay the pyretMessage
      if (pyretMessage) {
        postMessage(pyretMessage);
      }
    } else {
      addNtfToTabs(data.tab);
    }
  };

  function _hasControl() {
    return inControl === 'ME';
  }

  function _checkForControl(event) {
    if (!_hasControl()) {
      event.preventDefault();
      setShowControlWarning(true);
    }
  }

  function _resetWarning() {
    setShowControlWarning(false);
    resetViolation();
  }

  return (
    <Fragment>
      <ControlWarningModal
        showControlWarning={showControlWarning}
        toggleControlWarning={_resetWarning}
        takeControl={() => {
          props.toggleControl();
          _resetWarning();
        }}
        inControl={inControl}
        cancel={_resetWarning}
        inAdminMode={user.inAdminMode}
      />

      <div
        className={classes.Activity}
        onClickCapture={_checkForControl}
        id="containerParent"
        style={{
          height: '890px', // @TODO this needs to be adjusted based on the editor instance.
        }}
      >
        <iframe
          ref={cpoIframe}
          style={{
            width: '100%',
            height: '100%',
            pointerEvents: !_hasControl() ? 'none' : 'auto',
          }}
          title="pyret"
          src={iframeSrc}
        />
      </div>
    </Fragment>
  );
};

CodePyretOrg.propTypes = {
  room: PropTypes.shape({}).isRequired,
  tab: PropTypes.shape({}).isRequired,
  user: PropTypes.shape({}).isRequired,
  updatedRoom: PropTypes.func.isRequired,
  toggleControl: PropTypes.func.isRequired,
  setFirstTabLoaded: PropTypes.func.isRequired,
  inControl: PropTypes.string.isRequired,
  addNtfToTabs: PropTypes.func.isRequired,
  addToLog: PropTypes.func.isRequired,
};

export default CodePyretOrg;
