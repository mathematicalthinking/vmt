import React from 'react';
import PropTypes from 'prop-types';
import { ControlButton, Slider, Button } from 'Components';
import Awareness from './Awareness';
import classes from './tools.css';

/**
 * Tools shows some user actions and information underneath the chat area in
 * a replayer and a room.
 *
 * Recent changes (9/21/2022) to make Tools more of a configurable UI component (no business logic)
 * - clarified the props that represent events (all named "onXXX")
 * - removed the props that reflected different 'states' of Tools (replayer, inAdminMode). Instead, the clients of
 *   tools configure what should appear or not via whether an event action is given (e.g., no onToggleReference action means don't show
 *   Reference toggle).
 * - created a ControlButton that accepts the control state from the client and knows what to do with it. This button gets reused within Workspace.
 */
const Tools = ({
  inControl,
  lastEvent,
  referencing,
  isSimplified,
  onClickExit,
  onClickSave,
  onClickControl,
  onToggleSimpleChat,
  onToggleReference,
  onClickCreateActivity,
  exitText,
}) => {
  // controlText is what gets displayed in the control-related button (either Take Control, Release Control, Request Control,
  // or Requested).
  const [controlText, setControlText] = React.useState('Take Control'); // Needs a value, but doesn't matter as it gets set in the useEffect
  const [controlDisabled, setControlDisabled] = React.useState(false);
  const timer = React.useRef();

  // Prevent spamming of the RequestControl button. When that's clicked, disable the button for one minute
  // and change the text to Requested.
  const checkControl = () => {
    onClickControl();
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
    setControlText(determineControlText(inControl));
    return () => {
      // clear the timer before unmounting
      if (timer.current) clearTimeout(timer.current);
    };
  }, [inControl]);

  const resetRequested = () => {
    if (timer.current) clearTimeout(timer.current);
    setControlDisabled(false);
  };

  return (
    <div className={classes.Container}>
      <div className={classes.Expanded}>
        {onClickSave ? (
          <div className={classes.Save}>
            <div
              className={classes.SideButton}
              role="button"
              data-testid="save"
              onClick={onClickSave}
              onKeyPress={onClickSave}
              tabIndex="-3"
            >
              save
            </div>
          </div>
        ) : null}
        {onToggleReference && (
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
              action={onToggleReference}
              isOn={referencing}
              name="referencing"
            />
          </div>
        )}
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
            action={onToggleSimpleChat}
            isOn={!isSimplified}
            name="isSimplified"
          />
        </div>
        <div>
          <div className={classes.Controls}>
            {onClickControl ? (
              <ControlButton
                theme="xs"
                data-testid="control-button"
                controlState={{ text: controlText, disabled: controlDisabled }}
                onClick={checkControl}
              />
            ) : null}
            {onClickCreateActivity && (
              <Button
                theme="xs"
                data-testid="create-resource"
                click={onClickCreateActivity}
              >
                Create Template
              </Button>
            )}
            <Button
              theme="xs-cancel"
              click={onClickExit}
              data-testid="exit-room"
            >
              {exitText}
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
  onClickSave: PropTypes.func,
  referencing: PropTypes.bool,
  isSimplified: PropTypes.bool,
  onClickExit: PropTypes.func.isRequired,
  onClickControl: PropTypes.func,
  onToggleSimpleChat: PropTypes.func,
  onToggleReference: PropTypes.func,
  onClickCreateActivity: PropTypes.func,
  exitText: PropTypes.string.isRequired,
};

Tools.defaultProps = {
  onClickControl: null,
  onToggleSimpleChat: null,
  referencing: false,
  isSimplified: true,
  onToggleReference: null,
  lastEvent: null,
  inControl: null,
  onClickSave: null,
  onClickCreateActivity: null,
};

export default Tools;
