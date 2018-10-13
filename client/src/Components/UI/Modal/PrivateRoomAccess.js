import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Modal from './Modal';
import classes from './modal.css'
import TextInput from '../../Form/TextInput/TextInput';
import Button from '../Button/Button';
class PrivateRoomAccess extends Component {
  state = {
    entryCode: '',
    show: true,
  }

  updateEntry = (event) => {
    if (this.props.error) this.props.clearError();
    this.setState({entryCode: event.target.value})
  }

  closeModal = () => {
    if (this.props.error) this.props.clearError();
    this.setState({show: false})
    this.props.history.goBack()
  }

  componentWillUnmount() {
    if (this.props.error) this.props.clearError();
  }

  render () {
    return (
      <Modal show={this.state.show} closeModal={this.closeModal}>
        {!this.props.course ?
          <div>
            <p>This room is private. Enter the room's code to gain access</p>
            <TextInput type='text' name='entryCode' change={this.updateEntry}/>
            <Button click={() => this.props.requestAccess(this.state.entryCode)}>Join</Button>
            <Button click={this.closeModal}>Cancel</Button>
            <div className={classes.Error} data-testid='entry-code-error'>{this.props.error}</div>
          </div> :
          <p>This room belongs to a private course. Request access to the course to gain entry</p>
        }
      </Modal>
    )
  }
}

export default withRouter(PrivateRoomAccess);
