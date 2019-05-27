import React from 'react';
import PropTypes from 'prop-types';
import Awareness from './Awareness';
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
      {/* <h3 className={classes.Title}>Tools</h3> */}
      <div className={classes.Expanded}>
        <div className={classes.Controls}>
          {!replayer ? (
            <div
              className={classes.SideButton}
              role="button"
              data-testid="take-control"
              onClick={toggleControl}
              onKeyPress={toggleControl}
              tabIndex="-1"
            >
              {controlText}
            </div>
          ) : null}
          <div
            className={classes.Exit}
            role="button"
            onClick={goBack}
            onKeyPress={goBack}
            tabIndex="-2"
            // theme={"Small"}
            data-testid="exit-room"
          >
            Exit {replayer ? 'Replayer' : 'Room'}
          </div>
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
        <div className={classes.ReferenceWindow}>
          {!replayer ? (
            <div
              className={classes.ReferenceControls}
              onClick={referencing ? clearReference : startNewReference}
              onKeyPress={referencing ? clearReference : startNewReference}
              role="button"
              tabIndex="-4"
            >
              <i
                className={[
                  'fas',
                  'fa-mouse-pointer',
                  classes.MousePointer,
                  referencing ? classes.ReferencingActive : '',
                ].join(' ')}
              />
              <div className={classes.ReferenceTool}>Reference</div>
              {/* <div className={classes.RefrenceTool}>Perspective</div> */}
            </div>
          ) : null}
        </div>
        <div>
          <Awareness lastEvent={lastEvent} />
        </div>
      </div>
    </div>
  );
};

Tools.propTypes = {
  inControl: PropTypes.bool.isRequired,
  lastEvent: PropTypes.shape({}),
  replayer: PropTypes.bool,
  save: PropTypes.func,
  referencing: PropTypes.bool.isRequired,
  goBack: PropTypes.func.isRequired,
  toggleControl: PropTypes.func.isRequired,
  clearReference: PropTypes.func.isRequired,
  startNewReference: PropTypes.func.isRequired,
};

Tools.defaultProps = {
  lastEvent: null,
  replayer: false,
  save: null,
};

export default Tools;
