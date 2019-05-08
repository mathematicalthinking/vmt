import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import Modal from './Modal';
import classes from './modal.css';
import TextInput from '../../Form/TextInput/TextInput';
import Button from '../Button/Button';
class privateAccess extends Component {
  state = {
    entryCode: '',
    show: true,
  };

  updateEntry = event => {
    if (this.props.error) this.props.clearError();
    this.setState({ entryCode: event.target.value });
  };

  closeModal = () => {
    if (this.props.error) this.props.clearError();
    this.setState({ show: false });
    this.props.history.goBack();
  };

  componentWillUnmount() {
    if (this.props.error) this.props.clearError();
  }

  requestAccess = () => {
    let { resource, owners, resourceId, userId, requestAccess } = this.props;
    requestAccess(owners, userId, resource, resourceId);
    this.props.history.push('/confirmation');
  };

  joinWithCode = () => {
    let { resource, resourceId, userId, username, joinWithCode } = this.props;
    // put request was being made to /course/:id when it should be /courses/:id
    if (resource === 'course') {
      resource = 'courses';
    }
    if (resource === 'room') {
      resource = 'rooms';
    }
    joinWithCode(resource, resourceId, userId, username, this.state.entryCode);
  };

  render() {
    let { resource, user } = this.props;
    let displayResource = 'activity';
    if (resource === 'rooms') displayResource = 'room';
    if (resource === 'courses') displayResource = 'course';
    return (
      <Modal show={this.state.show} closeModal={this.closeModal}>
        <p className={classes.Description}>
          {`You currently don't have access to this ${displayResource}. If you know this
          ${displayResource}'s entry code, you can enter it below`}
        </p>
        <TextInput
          light
          type="text"
          name="entryCode"
          change={this.updateEntry}
        />
        <Button theme={'Small'} m={10} click={this.joinWithCode}>
          Join
        </Button>
        <p>{`Otherwise you can ask this ${resource}'s owner for access`}</p>
        <Button
          theme={'Small'}
          m={10}
          click={this.requestAccess}
          data-testid="request-access-btn"
        >
          Request Access
        </Button>
        {user.isAdmin ? (
          <Button data-testid="view-as-admin" click={this.props.setAdmin}>
            View as Admin
          </Button>
        ) : null}
        <div className={classes.Error} data-testid="entry-code-error">
          {this.props.error}
        </div>
      </Modal>
    );
  }
}

export default withRouter(privateAccess);
