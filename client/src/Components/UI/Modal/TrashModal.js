import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { STATUS } from 'constants.js';
import Modal from './Modal';
import classes from './modal.css';
import Button from '../Button/Button';

const hash = {
  course: 'courses',
  room: 'rooms',
  activity: 'templates',
};
class TrashModal extends Component {
  trashResource = () => {
    const { history, update, closeModal, resource, resourceId } = this.props;
    // The following ternary is a temp fix.
    // @TODO develop status flag for activities and courses, then get rid of isTrashed code
    // eslint-disable-next-line no-unused-expressions
    resource === 'room'
      ? update(resourceId, { isTrashed: true, status: STATUS.TRASHED })
      : update(resourceId, { isTrashed: true });
    closeModal();
    try {
      const success = history.goBack();
      if (!success) history.push(`/myVMT/${hash[resource]}`);
    } catch (err) {
      history.push(`/myVMT/${hash[resource]}`);
    }
  };

  trashResourceAndChildren = () => {
    const { history, update, closeModal, resource, resourceId } = this.props;
    update(resourceId, {
      isTrashed: true,
      trashChildren: true,
    });
    closeModal();
    history.push(`/myVMT/${hash[resource]}`);
  };

  render() {
    const { show, closeModal } = this.props;
    let { resource } = this.props;
    if (resource === 'activity') resource = 'template';
    return (
      <Modal show={show} closeModal={closeModal}>
        <div>{`Are you sure you want to delete this ${resource}`}?</div>
        <div className={classes.Row}>
          <Button
            m={10}
            theme="Danger"
            data-testid="confirm-trash"
            click={this.trashResource}
          >
            <i className="fas fa-trash-alt" /> delete this {resource}
          </Button>
          {resource === 'course' ? (
            <Button
              m={10}
              theme="Danger"
              data-testid="confirm-trash-children"
              click={this.trashResourceAndChildren}
            >
              <i className="fas fa-trash-alt" /> delete this course and all of
              its resources
            </Button>
          ) : null}
          <Button m={10} theme="Cancel" click={closeModal}>
            Cancel
          </Button>
        </div>
      </Modal>
    );
  }
}

TrashModal.propTypes = {
  history: PropTypes.shape({ goBack: PropTypes.func, push: PropTypes.func })
    .isRequired,
  update: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  resource: PropTypes.string.isRequired,
  resourceId: PropTypes.string.isRequired,
};
export default TrashModal;
