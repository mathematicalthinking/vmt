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
  
  requestAccess = () => {
    let { resource, owners, resourceId, userId, requestAccess } = this.props;
    requestAccess(owners, userId, resource, resourceId)
    this.props.history.push('/confirmation')
  }

  joinWithCode = () => {
    let { resource, resourceId, userId, username, joinWithCode } = this.props;
    joinWithCode(resource, resourceId, userId, username, this.state.entryCode)
  }

  render(){
    let { resource } = this.props;
    return (
      <Modal show={this.state.show} closeModal={this.closeModal}>
        <div className={classes.Close} onClick={this.closeModal}><i data-testid='close-modal' className="fas fa-times"></i></div>
        <p className={classes.Description}>{`You currently don't have access to this ${resource}. If you know this 
          ${resource}'s entry code, you can enter it below`}
        </p>
        <TextInput light type='text' name='entryCode' change={this.updateEntry}/>
        <Button theme={'Small'} m={10} click={this.joinWithCode}>Join</Button>
        <p>{`Otherwise you can ask this ${resource}'s owner for access`}</p>
        <Button theme={'Small'} m={10} click={this.requestAccess} data-testid='request-access-btn'>Request Access</Button>
        <div className={classes.Error} data-testid='entry-code-error'>{this.props.error}</div>
      </Modal>
    )
  }
}

export default withRouter(privateAccess);
