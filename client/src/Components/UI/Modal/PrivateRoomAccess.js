import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Modal from './Modal';
import TextInput from '../../Form/TextInput/TextInput';
import Button from '../Button/Button';
class PrivateRoomAccess extends Component {
  state = {
    entryCode: '',
    show: true,
  }
  closeModal = () => {
    this.setState({show: false})
    this.props.history.goBack()
  }
  render () {
    return (
      <Modal show={this.state.show} closeModal={this.closeModal}>
        {!this.props.course ?
          <div>
            <p>This course is private. Enter the room's code to gain access</p>
            <TextInput type='text' name='entryCode' change={event => this.setState({entryCode: event.target.value})}/>
            <Button click={() => this.props.requestAccess(this.state.entryCode)}>Join</Button>
          </div> :
          <p>This room belongs to a private course. Request access to the course to gain entry</p>
        }
      </Modal>
    )
  }
}

export default withRouter(PrivateRoomAccess);
