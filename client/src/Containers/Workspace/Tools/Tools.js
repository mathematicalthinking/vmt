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
}) => {
  let controlText;
  if (!replayer) {
    controlText = 'Request Control';
    if (inControl === 'ME') {
      controlText = 'Release Control';
    } else if (inControl === 'NONE') {
      controlText = 'Take Control';
    }
  }

  return (
    <div className={classes.Container}>
      <div className={classes.Expanded}>
        <div className={classes.Controls}>
          {!replayer && !inAdminMode ? (
            <Button
              theme="xs"
              data-testid={
                inControl === 'ME' ? 'release-control' : 'take-control'
              }
              click={toggleControl}
            >
              {controlText}
            </Button>
          ) : null}
          <Button theme="xs-cancel" click={goBack} data-testid="exit-room">
            Exit {replayer ? 'Replayer' : 'Room'}
          </Button>
        </div>
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
                isSimplified
                  ? classes.ActiveReferenceWindow
                  : classes.ReferenceWindow
              }
            >
              Simple Chat
              <Slider
                data-testid="simple-chat"
                action={toggleSimpleChat}
                isOn={isSimplified}
                name="isSimplified"
              />
            </div>
          </Fragment>
        ) : null}
        <div>
          <Awareness lastEvent={lastEvent} />
        </div>
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
  inAdminMode: PropTypes.bool,
};

Tools.defaultProps = {
  toggleControl: null,
  toggleSimpleChat: null,
  referencing: false,
  isSimplified: false,
  clearReference: null,
  startNewReference: null,
  lastEvent: null,
  inControl: null,
  replayer: false,
  save: null,
  inAdminMode: false,
};

export default Tools;
