import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Modal from './Modal';
import classes from './modal.css'
import TextInput from '../../Form/TextInput/TextInput';
import Button from '../Button/Button';
class privateAccess extends Component {

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

  render(){
    return (
      <Modal show={this.state.show} closeModal={this.closeModal}>
        <p>{`You currently don't have access to this ${this.props.resource}. If you know this 
          ${this.props.resource}'s entry code, you can enter it below`}
        </p>
        <TextInput type='text' name='entryCode' change={this.updateEntry}/>
        <Button click={() => this.props.requestAccess(this.state.entryCode)}>Join</Button>
        <p>Otherwise you can request access by clicking
          <span click={this.props.requestAccess}>here</span>
        </p>
        <Button click={this.props.requestAccess} data-testid='request-access-btn'>Request Access</Button>
        <Button click={this.closeModal}>Cancel</Button>
      </Modal>
    )
  }
}

export default withRouter(privateAccess);
