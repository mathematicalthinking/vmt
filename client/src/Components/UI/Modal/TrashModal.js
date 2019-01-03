import React, { Component } from 'react';
import Modal from './Modal';
import classes from './modal.css'
import Button from '../Button/Button';
class TrashModal extends Component {


  trashResource = () => {
    this.props.history.push('/myVMT/courses');
    this.props.update(this.props.resourceId, {isTrashed: true})
    this.props.closeModal()
  }

  trashResourceAndChildren = () => {
    let hash = {
      course: 'courses',
      room: 'rooms',
      activity: 'activities'
    }
    this.props.history.push(`/myVMT/${hash[this.props.resource]}`);
    this.props.update(this.props.resourceId, {isTrashed: true, trashChildren: true})
    this.props.closeModal()
  }

  render() {
    return (
      <Modal show={this.props.show} closeModal={this.props.closeModal}>
        <div>{`Are you sure you want to delete this ${this.props.resource}`}?</div>
        <div className={classes.Row}>
          <Button m={10} theme='Danger' data-testid='confirm-trash' click={this.trashResource}><i className="fas fa-trash-alt"></i> delete this {this.props.resource}</Button>
          {this.props.resource === 'course'
            ? <Button m={10} theme='Danger' data-testid='confirm-trash-children' click={this.trashResourceAndChildren}><i className="fas fa-trash-alt"></i> delete this course and all of its resources</Button>
            : null
          }
          <Button m={10} theme='Cancel' click={this.props.closeModal}>Cancel</Button>
        </div>
      </Modal>
    )
  }
}

export default TrashModal;
