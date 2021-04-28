import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import classes from './modal.css';
import Button from '../Button/Button';
import { Checkbox } from '../..';

class CheckboxModal extends Component {
  onSelect(event) {
    const { onSelect } = this.props;

    if (onSelect) {
      onSelect(event);
    }
  }
  render() {
    const {
      show,
      closeModal,
      infoMessage,
      isChecked,
      checkboxDataId,
    } = this.props;

    return (
      <Modal show={show} closeModal={closeModal}>
        <div>{infoMessage}</div>
        {closeModal && (
          <Fragment>
            <div className={classes.Row}>
              <Checkbox
                change={(event) => {
                  this.onSelect(event);
                }}
                checked={isChecked}
                dataId={checkboxDataId}
              >
                Do not show me this message again
              </Checkbox>
            </div>

            <div className={classes.Row}>
              <Button m={10} click={closeModal}>
                Okay
              </Button>
            </div>
          </Fragment>
        )}
      </Modal>
    );
  }
}

CheckboxModal.defaultProps = {
  isChecked: false,
  checkboxDataId: null,
};

CheckboxModal.propTypes = {
  show: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  infoMessage: PropTypes.string.isRequired,
  onSelect: PropTypes.func.isRequired,
  isChecked: PropTypes.bool,
  checkboxDataId: PropTypes.string,
};
export default CheckboxModal;
