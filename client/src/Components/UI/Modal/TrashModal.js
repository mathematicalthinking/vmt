import React, { Component } from 'react';
import Modal from './Modal';
import classes from './modal.css'
import Button from '../Button/Button';
class TrashModal extends Component {


  trashResource = () => {
    this.props.history.goBack()
    this.props.update(this.props.resourceId, {isTrashed: true})
    this.props.closeModal()
  }

  render() {
    return (
      <Modal show={this.props.show} closeModal={this.props.closeModal}>
        <div>{`Are you sure you want to delete this ${this.props.resource}`}</div>
        <div className={classes.Row}>
          <Button m={10} theme='Danger' click={this.trashResource}>Yes</Button>
          <Button m={10} theme='Cancel' click={this.props.closeModal}>Cancel</Button>
        </div>
      </Modal>
    )
  }
}

export default TrashModal;
