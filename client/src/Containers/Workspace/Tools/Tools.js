import React from 'react';
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
  goBack,
  toggleControl,
  clearReference,
  startNewReference,
  goToReplayerOrRoom,
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

  const goToText = replayer ? 'Room' : 'Replayer';
  return (
    <div className={classes.Container}>
      {/* <h3 className={classes.Title}>Tools</h3> */}
      <div className={classes.Expanded}>
        <div className={classes.Controls}>
          {!replayer ? (
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
        {!replayer ? (
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
              onClick={referencing ? clearReference : startNewReference}
              isOn={referencing}
            />
          </div>
        ) : null}
        {goToReplayerOrRoom ? (
          <Button
            theme="xs"
            click={() => {
              const arg = replayer ? 'room' : 'replayer';
              goToReplayerOrRoom(arg);
            }}
          >
            Go to {goToText}
            <span className={classes.ExternalLink}>
              <i className="fas fa-external-link-alt" />
            </span>
          </Button>
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
  goBack: PropTypes.func.isRequired,
  toggleControl: PropTypes.func,
  clearReference: PropTypes.func,
  startNewReference: PropTypes.func,
  goToReplayerOrRoom: PropTypes.func,
};

Tools.defaultProps = {
  toggleControl: null,
  referencing: false,
  clearReference: null,
  startNewReference: null,
  lastEvent: null,
  inControl: null,
  replayer: false,
  save: null,
  goToReplayerOrRoom: null,
};

export default Tools;
