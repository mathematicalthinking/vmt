import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import Modal from './Modal';
import classes from './modal.css';
import TextInput from '../../Form/TextInput/TextInput';
import Button from '../Button/Button';

class PrivateAccess extends Component {
  state = {
    entryCode: '',
    show: true,
  };

  componentWillUnmount() {
    const { error, clearError } = this.props;
    if (error) clearError();
  }
  updateEntry = (event) => {
    const { error, clearError } = this.props;
    if (error) clearError();
    this.setState({ entryCode: event.target.value });
  };

  closeModal = () => {
    const { error, clearError, history, resource } = this.props;
    if (error) clearError();
    this.setState({ show: false });

    // right now only course or room
    let pluralResource = resource;

    if (resource === 'course') {
      pluralResource = 'courses';
    } else if (resource === 'room') {
      pluralResource = 'rooms';
    } else if (resource === 'activity') {
      pluralResource = 'activities';
    }

    let query = '?privacy=all&roomType=all';

    if (resource === 'course') {
      query = '?privacy=all';
    }
    history.push(`/community/${pluralResource}${query}`);
    // history.goBack();
  };

  requestAccess = () => {
    const {
      resource,
      owners,
      resourceId,
      userId,
      requestAccess,
      history,
    } = this.props;
    requestAccess(owners, userId, resource, resourceId);
    history.push('/confirmation');
  };

  joinWithCode = () => {
    const { resource, resourceId, userId, username, joinWithCode } = this.props;
    const { entryCode } = this.state;
    let singResource = resource;
    // put request was being made to /course/:id when it should be /courses/:id
    if (resource === 'course') {
      singResource = 'courses';
    }
    if (resource === 'room') {
      singResource = 'rooms';
    }
    joinWithCode(singResource, resourceId, userId, username, entryCode);
  };

  render() {
    const { resource, user, setAdmin, error } = this.props;
    const { show, entryCode } = this.state;
    let displayResource = 'activity template';
    if (resource === 'rooms') displayResource = 'room';
    if (resource === 'courses') displayResource = 'course';

    if (displayResource === 'activity') {
      return (
        <Modal show={show} closeModal={this.closeModal}>
          <p className={classes.Description}>
            {`You currently don't have access to this ${displayResource}. Access via entry code is not yet available for private activities.`}
          </p>
          <Button theme="Small" m={10} click={this.closeModal}>
            Okay
          </Button>
        </Modal>
      );
    }
    return (
      <Modal show={show} closeModal={this.closeModal}>
        <p className={classes.Description}>
          {`You currently don't have access to this ${displayResource}. If you know this
          ${displayResource}'s entry code, you can enter it below`}
        </p>
        <TextInput
          light
          type="text"
          value={entryCode}
          placeholder="entry code"
          name="entryCode"
          change={this.updateEntry}
        />
        <Button theme="Small" m={10} click={this.joinWithCode}>
          Join
        </Button>
        <p>{`Otherwise you can ask this ${resource}'s owner for access`}</p>
        <Button
          theme="Small"
          m={10}
          click={this.requestAccess}
          data-testid="request-access-btn"
        >
          Request Access
        </Button>
        {user.isAdmin ? (
          <Button data-testid="view-as-admin" click={setAdmin}>
            View as Admin
          </Button>
        ) : null}
        <div className={classes.Error} data-testid="entry-code-error">
          {error}
        </div>
      </Modal>
    );
  }
}

PrivateAccess.propTypes = {
  resource: PropTypes.string.isRequired,
  owners: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  resourceId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  requestAccess: PropTypes.func.isRequired,
  user: PropTypes.shape({}).isRequired,
  setAdmin: PropTypes.func,
  username: PropTypes.string.isRequired,
  joinWithCode: PropTypes.func.isRequired,
  history: PropTypes.shape({}).isRequired,
  error: PropTypes.string,
  clearError: PropTypes.func.isRequired,
};

PrivateAccess.defaultProps = {
  error: null,
  setAdmin: null,
};

export default withRouter(PrivateAccess);
