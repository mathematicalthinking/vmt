import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { confirmEmail, clearError } from '../../store/actions';
import SmallLoading from '../../Components/Loading/SmallLoading';
import { Aux, Background, Button } from '../../Components';
import classes from './confirmEmail.css';

import auth from '../../utils/auth';

class ConfirmEmail extends Component {
  state = {
    isVerifyingToken: false,
    tokenErrorMessage: null,
    isTokenValid: false,
    isResendingEmail: false,
    resendSuccessMsg: null,
    resendErrorMsg: null,
  };

  componentDidMount() {
    const { match } = this.props;
    const { token } = match.params;

    this.verifyToken(token);
  }

  verifyToken = token => {
    this.setState({
      isVerifyingToken: true,
    });

    auth
      .confirmEmail(token)
      .then(res => {
        const { isValid, info } = res.data;
        if (isValid) {
          this.setState({
            isVerifyingToken: false,
            isTokenValid: true,
          });
        } else {
          this.setState({
            isVerifyingToken: false,
            tokenErrorMessage: info,
            isTokenValid: false,
          });
        }
      })
      .catch(err => {
        this.setState({
          isVerifyingToken: false,
          tokenErrorMessage: err.errorMessage || err.message,
        });
      });
  };

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
    const {
      isVerifyingToken,
      tokenErrorMessage,
      isTokenValid,
      isResendingEmail,
      resendSuccessMsg,
      resendErrorMsg,
    } = this.state;

    const { loggedIn, isEmailConfirmed, email } = this.props;

    if (loggedIn && (isEmailConfirmed || typeof email !== 'string')) {
      return <Redirect to="/myVMT/rooms" />;
    }

    if (isTokenValid) {
      return (
        <Aux>
          <Background />
          <div className={classes.Main}>
            <div>Your email has been successfully confirmed!</div>
          </div>
        </Aux>
      );
    }

    if (isVerifyingToken) {
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
          <div>{tokenErrorMessage}</div>
          {loggedIn ? (
            <Button
              data-testid="resend-btn"
              click={this.resendConfirmationEmail}
              m={20}
            >
              Resend Confirmation Email
            </Button>
          ) : null}
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
};

ConfirmEmail.defaultProps = {
  isEmailConfirmed: false,
  email: null,
};

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
    loading: store.loading.loading,
    isEmailConfirmed: store.user.isEmailConfirmed,
    email: store.user.email,
  };
};

export default connect(
  mapStateToProps,
  { connectConfirmEmail: confirmEmail, connectClearError: clearError }
)(ConfirmEmail);
