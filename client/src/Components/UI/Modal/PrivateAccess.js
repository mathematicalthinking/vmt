import React, { Component } from 'react';
import Modal from './Modal';
import Button from '../Button/Button';
import { withRouter } from 'react-router-dom';
class privateAccess extends Component {

  state = {
    show: true
  }

  closeModal = () => {
    this.setState({show: false})
    this.props.history.goBack();
  }

  render(){
    return (
      <Modal show={this.state.show} closeModal={this.closeModal}>
        <p>You currently don't have access to this course. If you would like to
          request access from the owner click "Join". When your request is accepted
          this course will appear in your list of courses on your profile.
        </p>
        <Button click={this.props.requestAccess}>Join</Button>
      </Modal>
    )
  }
}

export default withRouter(privateAccess);
