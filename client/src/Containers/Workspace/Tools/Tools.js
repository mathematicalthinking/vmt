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
 * - uses a ControlButton that accepts the control state from the client and knows what to do with it. This button gets reused within Workspace.
 */
const Tools = ({
  controlState,
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
  return (
    <div className={classes.Container}>
      <div className={classes.Expanded}>
        {onClickSave && (
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
        )}
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
            {onClickControl && controlState && (
              <ControlButton
                theme="xs"
                data-testid="control-button"
                controlState={controlState}
                onClick={onClickControl}
              />
            )}
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
  controlState: PropTypes.shape({}),
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
  controlState: null,
  onClickSave: null,
  onClickCreateActivity: null,
};

export default Tools;
