import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import Awareness from './Awareness';
import Slider from '../../../Components/UI/Button/Slider';
import Button from '../../../Components/UI/Button/Button';
import classes from './tools.css';

const Tools = ({
  inControl,
  lastEvent,
  replayer,
  save,
  referencing,
  isSimplified,
  goBack,
  toggleControl,
  toggleSimpleChat,
  clearReference,
  startNewReference,
  inAdminMode,
  createActivity,
}) => {
  // controlText is what gets displayed in the control-related button (either Take Control, Release Control, Request Control,
  // or Requested).
  const [controlText, setControlText] = React.useState('Take Control'); // Needs a value, but doesn't matter as it gets set in the useEffect
  const [controlDisabled, setControlDisabled] = React.useState(false);
  const timer = React.useRef();

  // Prevent spamming of the RequestControl button. When that's clicked, disable the button for one minute
  // and change the text to Requested.
  const checkControl = () => {
    toggleControl();
    if (controlText === 'Request Control') {
      setControlDisabled(true);
      setControlText('Requested');
      timer.current = setTimeout(() => {
        setControlDisabled(false);
        setControlText(determineControlText(inControl));
      }, 60000);
    }
  };

  const determineControlText = (controller) => {
    switch (controller) {
      case 'ME':
        return 'Release Control';
      case 'NONE':
        return 'Take Control';
      default:
        return 'Request Control';
    }
  };

  // When the person in control changes, we want to reset the button (i.e., undisable) and adjust the text of the
  // button as appropriate.
  React.useEffect(() => {
    resetRequested();
    if (!replayer) setControlText(determineControlText(inControl));
    return () => {
      // clear the timer before unmounting
      if (timer.current) clearTimeout(timer.current);
    };
  }, [replayer, inControl]);

  const resetRequested = () => {
    if (timer.current) clearTimeout(timer.current);
    setControlDisabled(false);
  };

  return (
    <div className={classes.Container}>
      <div className={classes.Expanded}>
        {save ? (
          <div className={classes.Save}>
            <div
              className={classes.SideButton}
              role="button"
              data-testid="save"
              onClick={save}
              onKeyPress={save}
              tabIndex="-3"
            >
              save
            </div>
          </div>
        ) : null}
        {!replayer && !inAdminMode ? (
          <Fragment>
            <div
              className={
                referencing
                  ? classes.ActiveReferenceWindow
                  : classes.ReferenceWindow
              }
            >
              Referencing
              <Slider
                data-testid="new-reference"
                action={referencing ? clearReference : startNewReference}
                isOn={referencing}
                name="referencing"
              />
            </div>
            <div
              className={
                !isSimplified
                  ? classes.ActiveReferenceWindow
                  : classes.ReferenceWindow
              }
            >
              Detailed Chat
              <Slider
                data-testid="simple-chat"
                action={toggleSimpleChat}
                isOn={!isSimplified}
                name="isSimplified"
              />
            </div>
          </Fragment>
        ) : (
          <div
            className={
              !isSimplified
                ? classes.ActiveReferenceWindow
                : classes.ReferenceWindow
            }
          >
            Detailed Chat
            <Slider
              data-testid="simple-chat"
              action={toggleSimpleChat}
              isOn={!isSimplified}
              name="isSimplified"
            />
          </div>
        )}
        <div>
          <div className={classes.Controls}>
            {!replayer && !inAdminMode ? (
              <Button
                theme="xs"
                data-testid="control-button"
                disabled={controlDisabled}
                click={checkControl}
              >
                {controlText}
              </Button>
            ) : null}
            {replayer && (
              <Button
                theme="xs"
                data-testid="create-resource"
                click={createActivity}
              >
                Create Template
              </Button>
            )}
            <Button theme="xs-cancel" click={goBack} data-testid="exit-room">
              Exit {replayer ? 'Replayer' : 'Room'}
            </Button>
          </div>
        </div>
        <Awareness lastEvent={lastEvent} />
      </div>
    </div>
  );
};

Tools.propTypes = {
  inControl: PropTypes.string,
  lastEvent: PropTypes.shape({}),
  replayer: PropTypes.bool,
  save: PropTypes.func,
  referencing: PropTypes.bool,
  isSimplified: PropTypes.bool,
  goBack: PropTypes.func.isRequired,
  toggleControl: PropTypes.func,
  toggleSimpleChat: PropTypes.func,
  clearReference: PropTypes.func,
  startNewReference: PropTypes.func,
  createActivity: PropTypes.func,
  inAdminMode: PropTypes.bool,
};

Tools.defaultProps = {
  toggleControl: null,
  toggleSimpleChat: null,
  referencing: false,
  isSimplified: true,
  clearReference: null,
  startNewReference: null,
  lastEvent: null,
  inControl: null,
  replayer: false,
  save: null,
  inAdminMode: false,
  createActivity: () => {},
};

export default Tools;
