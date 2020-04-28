import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import classes from './modal.css';
import Button from '../Button/Button';

// NOT READY FOR USE WITH COURSES OR ACTIVITIES
const hash = {
  course: 'courses',
  room: 'rooms',
  activity: 'activities',
};
class ArchiveModal extends Component {
  archiveResource = () => {
    const {
      history,
      update,
      closeModal,
      resource,
      resourceId,
      restoring,
    } = this.props;
    const updateBody = restoring
      ? { isArchived: false, isTrashed: false }
      : { isArchived: true };
    history.push(`/myVMT/${hash[resource]}`);
    update(resourceId, updateBody);
    closeModal();
  };

  // archiveResourceAndChildren = () => {
  //   const { history, update, closeModal, resource, resourceId } = this.props;
  //   update(resourceId, {
  //     isArchived: true,
  //     archiveChildren: true,
  //   });
  //   closeModal();
  //   history.push(`/myVMT/${hash[resource]}`);
  // };

  render() {
    const { show, closeModal, resource, restoring } = this.props;
    const actionName = restoring ? 'restore' : 'archive';
    const iconClass = restoring ? 'fas fa-undo' : 'fas fa-archive';
    return (
      <Modal show={show} closeModal={closeModal}>
        <div>
          Are you sure you want to {actionName} this {resource}?
        </div>
        <div className={classes.Row}>
          <Button
            m={10}
            theme="Danger"
            data-testid="confirm-archive"
            click={this.archiveResource}
          >
            <i className={iconClass} />
            {actionName} this {resource}
          </Button>
          <Button m={10} theme="Cancel" click={closeModal}>
            Cancel
          </Button>
        </div>
      </Modal>
    );
  }
}

ArchiveModal.propTypes = {
  history: PropTypes.shape({}).isRequired,
  update: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  resource: PropTypes.string.isRequired,
  resourceId: PropTypes.string.isRequired,
  restoring: PropTypes.bool.isRequired,
};
export default ArchiveModal;
