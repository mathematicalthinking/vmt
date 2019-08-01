import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import SmallLoading from '../../Components/Loading/SmallLoading';
import { Aux, Background, Button } from '../../Components';
import classes from './unconfirmed.css';

import auth from '../../utils/auth';

class Unconfirmed extends Component {
  state = {
    isResendingEmail: false,
    resendErrorMsg: null,
    resendSuccessMsg: null,
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
    const { isResendingEmail, resendErrorMsg, resendSuccessMsg } = this.state;
    const { loggedIn, email, isEmailConfirmed, username } = this.props;

    const resultMsg = resendSuccessMsg || resendErrorMsg || '';

    if (!loggedIn) {
      return <Redirect to="/login" />;
    }
    if (isEmailConfirmed === true || email.length === 0) {
      return <Redirect to="/myVMT/rooms" />;
    }

    return (
      <Aux>
        <Background />
        <div className={classes.Main}>
          <div className={classes.Info}>
            <p>
              Hi {username}, Thank you for taking the time to create a VMT
              account.{' '}
            </p>
            <p>
              In order to start using the VMT software, we need to confirm your
              email address. Please check {email} for an email containing
              further instructions.
            </p>
            <p>
              If for some reason the email is not delivered, please click the
              button below to have a new email sent.
            </p>
          </div>
          {isResendingEmail ? (
            <SmallLoading />
          ) : (
            <Button click={this.resendConfirmationEmail} m={20}>
              Resend Confirmation Email
            </Button>
          )}
          <div>{resultMsg}</div>
        </div>
      </Aux>
    );
  }
}

Unconfirmed.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  email: PropTypes.string,
  isEmailConfirmed: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
};

Unconfirmed.defaultProps = {
  email: null,
};

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    isEmailConfirmed: store.user.isEmailConfirmed,
    email: store.user.email,
    username: store.user.username,
  };
};

export default connect(
  mapStateToProps,
  null
)(Unconfirmed);
