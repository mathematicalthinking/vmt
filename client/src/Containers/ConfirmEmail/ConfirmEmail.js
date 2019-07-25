import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { updateUser, confirmEmail, clearError } from '../../store/actions';
import SmallLoading from '../../Components/Loading/SmallLoading';
import { Aux, Background, Button } from '../../Components';
import classes from './confirmEmail.css';

import auth from '../../utils/auth';

class ConfirmEmail extends Component {
  state = {
    isResendingEmail: false,
    resendSuccessMsg: null,
    resendErrorMsg: null,
  };

  componentDidMount() {
    const { match, connectConfirmEmail } = this.props;
    const { token } = match.params;

    connectConfirmEmail(token);
  }

  componentWillUnmount() {
    const { errorMessage, connectClearError } = this.props;
    if (errorMessage) {
      connectClearError();
    }
  }

  resendConfirmationEmail = () => {
    this.setState({
      isResendingEmail: true,
      resendSuccessMsg: null,
      resendErrorMsg: null,
    });
    auth
      .resendEmailConfirmation()
      .then(results => {
        const { isSuccess, info } = results.data;
        if (isSuccess) {
          this.setState({
            resendSuccessMsg: info,
            isResendingEmail: false,
          });
        } else {
          this.setState({
            resendErrorMsg: info,
            isResendingEmail: false,
          });
        }
      })
      .catch(err => {
        this.setState({
          isResendingEmail: false,
          resendErrorMsg: err.errorMessage || err.message,
        });
      });
  };

  render() {
    const { isResendingEmail, resendSuccessMsg, resendErrorMsg } = this.state;

    const {
      loggedIn,
      isEmailConfirmed,
      email,
      loading,
      errorMessage,
      confirmEmailSuccess,
    } = this.props;

    // redirect if user's email has already been confirmed or they do not have an email
    if (loggedIn && (isEmailConfirmed || email.length === 0)) {
      return <Redirect to="/myVMT/rooms" />;
    }

    if (confirmEmailSuccess) {
      return (
        <Aux>
          <Background />
          <div className={classes.Main}>
            <div>Your email has been successfully confirmed!</div>
          </div>
          {loggedIn ? null : (
            <Link
              data-testid="confirm-link-login"
              className={classes.Link}
              to="/login"
            >
              Login now{' '}
            </Link>
          )}
        </Aux>
      );
    }

    if (loading) {
      return (
        <Aux>
          <Background />
          <SmallLoading />
        </Aux>
      );
    }

    return (
      <Aux>
        <Background />
        <div className={classes.Main}>
          <div>{errorMessage}</div>
          {loggedIn ? (
            <Button
              data-testid="resend-btn"
              click={this.resendConfirmationEmail}
              m={20}
            >
              Resend Confirmation Email
            </Button>
          ) : (
            <Link
              data-testid="confirm-link-login"
              className={classes.Link}
              to="/login"
            >
              Login now{' '}
            </Link>
          )}
          {isResendingEmail ? (
            <SmallLoading />
          ) : (
            <div>{resendSuccessMsg || resendErrorMsg}</div>
          )}
        </div>
      </Aux>
    );
  }
}

ConfirmEmail.propTypes = {
  match: PropTypes.shape({}).isRequired,
  loggedIn: PropTypes.bool.isRequired,
  isEmailConfirmed: PropTypes.bool,
  email: PropTypes.string,
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
  connectConfirmEmail: PropTypes.func.isRequired,
  confirmEmailSuccess: PropTypes.bool,
  connectClearError: PropTypes.func.isRequired,
};

ConfirmEmail.defaultProps = {
  isEmailConfirmed: false,
  email: null,
  errorMessage: null,
  loading: false,
  confirmEmailSuccess: false,
};

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
    loading: store.loading.loading,
    isEmailConfirmed: store.user.isEmailConfirmed,
    email: store.user.email,
    confirmEmailSuccess: store.loading.confirmEmailSuccess,
  };
};

export default connect(
  mapStateToProps,
  {
    connectUpdateUser: updateUser,
    connectConfirmEmail: confirmEmail,
    connectClearError: clearError,
  }
)(ConfirmEmail);
