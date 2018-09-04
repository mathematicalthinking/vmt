import React, { Component } from 'react';
import Modal from './Modal';
import TextInput from '../../Form/TextInput/TextInput';
import Button from '../Button/Button';
class PrivateRoomAccess extends Component {
  state = {
    entryCode: '',
  }
  render () {
    return (
      <Modal show={true}>
        {!this.props.course ?
          <div>
            <p>This course is private. Enter the room's code to gain access</p>
            <TextInput type='text' name='entryCode' change={event => this.setState({entryCode: event.target.value})}/>
            <Button click={() => this.props.requestAccess(this.state.entryCode)}>Join</Button>
          </div> :
          <p>This rooms belongs to a private course. Request access to the course to gain entry</p>
        }
      </Modal>
    )
  }
}

export default PrivateRoomAccess;
