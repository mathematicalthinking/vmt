import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button, ControlButton } from 'Components';
import { buttonConfigs } from 'utils';

const ControlWarningModal = ({
  inControl,
  takeControl,
  cancel,
  showControlWarning,
  inAdminMode,
}) => {
  let msg = `You can't make updates when you're not in control.`;
  let cancelText = 'Cancel';
  let cancelTheme = 'Cancel';
  let regularTheme;

  if (inControl === 'REQUESTED') {
    msg = 'Your request has already been received.';
    cancelText = 'I still want control';
    cancelTheme = undefined;
    regularTheme = 'Cancel';
  }

  if (inAdminMode) {
    msg = "You can't make updates when you're in admin mode.";
    cancelText = 'Okay';
    cancelTheme = 'Small';
  }

  const _controlState = () => {
    if (buttonConfigs[inControl] && inControl !== 'REQUESTED')
      return buttonConfigs[inControl];

    // Just in cases (cf. "Love, Actually")
    const text = (() => {
      switch (inControl) {
        case 'NONE':
          return 'Take Control';
        case 'ME':
          return 'Release Control';
        case 'OTHER':
          return 'Request Control';
        case 'REQUESTED':
          return "I don't want control";
        default:
          return 'Unknown';
      }
    })();

    return { text, disabled: false };
  };

  return (
    <Modal show={showControlWarning} closeModal={cancel}>
      <div data-testid="control-warning">{msg}</div>
      <div>
        {!inAdminMode ? (
          <ControlButton
            m={5}
            theme={regularTheme}
            onClick={takeControl}
            controlState={_controlState()}
          />
        ) : null}
        <Button theme={cancelTheme} m={5} click={cancel} data-testid="cancel">
          {cancelText}
        </Button>
      </div>
    </Modal>
  );
};

ControlWarningModal.defaultProps = {
  inAdminMode: false,
};

ControlWarningModal.propTypes = {
  inControl: PropTypes.string.isRequired,
  showControlWarning: PropTypes.bool.isRequired,
  takeControl: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  inAdminMode: PropTypes.bool,
};

export default ControlWarningModal;
