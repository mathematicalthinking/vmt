import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  updateUser,
  confirmEmail,
  clearError,
  logout,
} from '../../store/actions';
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

  logout = () => {
    const { connectLogout } = this.props;
    connectLogout();
  };

  render() {
    const { isResendingEmail, resendSuccessMsg, resendErrorMsg } = this.state;

    const {
      loggedIn,
      email,
      loading,
      errorMessage,
      confirmEmailSuccess,
      confirmedEmail,
    } = this.props;

    const doPromptLogout =
      loggedIn && confirmEmailSuccess && email !== confirmedEmail;

    if (confirmEmailSuccess) {
      return (
        <Aux>
          <Background />
          <div className={classes.Main}>
            <div>{confirmedEmail} has been successfully confirmed!</div>
            {doPromptLogout ? (
              <div>
                <p>
                  Click Log Out below if you would like to log in to the account
                  associated with {confirmedEmail}
                </p>
                <Button
                  data-testid="confirmEmail-logout"
                  click={this.logout}
                  m={20}
                >
                  Log Out
                </Button>
              </div>
            ) : null}
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
  email: PropTypes.string,
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
  connectConfirmEmail: PropTypes.func.isRequired,
  confirmEmailSuccess: PropTypes.bool,
  connectClearError: PropTypes.func.isRequired,
  confirmedEmail: PropTypes.string,
  connectLogout: PropTypes.func.isRequired,
  history: PropTypes.shape({}).isRequired,
};

ConfirmEmail.defaultProps = {
  email: null,
  errorMessage: null,
  loading: false,
  confirmEmailSuccess: false,
  confirmedEmail: null,
};

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.confirmEmailErrorMsg,
    loading: store.loading.isConfirmingEmail,
    isEmailConfirmed: store.user.isEmailConfirmed,
    email: store.user.email,
    confirmEmailSuccess: store.loading.confirmEmailSuccess,
    confirmedEmail: store.loading.confirmedEmail,
  };
};

export default connect(
  mapStateToProps,
  {
    connectUpdateUser: updateUser,
    connectConfirmEmail: confirmEmail,
    connectClearError: clearError,
    connectLogout: logout,
  }
)(ConfirmEmail);
