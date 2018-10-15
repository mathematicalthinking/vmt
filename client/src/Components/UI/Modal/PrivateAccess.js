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

  render(){
    let { resource, joinWithCode } = this.props;
    console.log('THIS>POROPS: ', this.props)
    return (
      <Modal show={this.state.show} closeModal={this.closeModal}>
        <div className={classes.Close} onClick={this.closeModal}><i className="fas fa-times"></i></div>
        <p className={classes.Description}>{`You currently don't have access to this ${resource}. If you know this 
          ${resource}'s entry code, you can enter it below`}
        </p>
        <TextInput type='text' name='entryCode' change={this.updateEntry}/>
        <Button click={() => joinWithCode(this.state.entryCode)}>Join</Button>
        <p>{`Otherwise you can ask the ${resource}'s owner for access`}</p>
        <Button click={this.requestAccess} data-testid='request-access-btn'>Request Access</Button>
        <div className={classes.Error} data-testid='entry-code-error'>{this.props.error}</div>
      </Modal>
    )
  }
}

export default withRouter(privateAccess);
