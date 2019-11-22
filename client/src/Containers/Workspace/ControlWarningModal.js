import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from '../../Components';

const ControlWarningModal = ({
  inControl,
  takeControl,
  cancel,
  showControlWarning,
  inAdminMode,
}) => {
  let msg = `You can't make updates when you're not in control. Click "Take Control" first.`;
  let cancelText = 'Cancel';
  let cancelTheme = 'Cancel';

  if (inAdminMode) {
    msg = "You can't make updates when you're in admin mode.";
    cancelText = 'Okay';
    cancelTheme = 'Small';
  }
  return (
    <Modal show={showControlWarning} closeModal={cancel}>
      <div data-testid="control-warning">{msg}</div>
      <div>
        {!inAdminMode ? (
          <Button m={5} click={takeControl}>
            {inControl === 'NONE' ? 'Take Control' : 'Request Control'}
          </Button>
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
