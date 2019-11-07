import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from '../../Components';

const ControlWarningModal = ({
  inControl,
  takeControl,
  cancel,
  showControlWarning,
  // toggleControlWarning,
}) => {
  return (
    <Modal show={showControlWarning} closeModal={cancel}>
      <div data-testid="control-warning">
        You can&#39;t make updates when you&#39;re not in control click
        &#34;Take Control&#34; first.
      </div>
      <div>
        <Button m={5} click={takeControl}>
          {inControl === 'NONE' ? 'Take Control' : 'Request Control'}
        </Button>
        <Button theme="Cancel" m={5} click={cancel} data-testid="cancel">
          Cancel
        </Button>
      </div>
    </Modal>
  );
};

ControlWarningModal.propTypes = {
  inControl: PropTypes.string.isRequired,
  showControlWarning: PropTypes.bool.isRequired,
  takeControl: PropTypes.func.isRequired,
  cancel: PropTypes.func.isRequired,
  // toggleControlWarning: PropTypes.func.isRequired,
};

export default ControlWarningModal;
