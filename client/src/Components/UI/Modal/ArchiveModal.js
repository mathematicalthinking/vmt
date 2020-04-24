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
    const { history, update, closeModal, resource, resourceId } = this.props;
    history.push(`/myVMT/${hash[resource]}`);
    update(resourceId, { isArchived: true });
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
    const { show, closeModal, resource } = this.props;
    return (
      <Modal show={show} closeModal={closeModal}>
        <div>{`Are you sure you want to archive this ${resource}`}?</div>
        <div className={classes.Row}>
          <Button
            m={10}
            theme="Danger"
            data-testid="confirm-archive"
            click={this.archiveResource}
          >
            <i className="fas fa-archive" /> archive this {resource}
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
};
export default ArchiveModal;
