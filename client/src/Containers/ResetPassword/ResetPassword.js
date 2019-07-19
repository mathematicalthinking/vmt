import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';
import { resetPassword, clearError } from '../../store/actions';
import { ResetPasswordLayout } from '../../Layout';
import SmallLoading from '../../Components/Loading/SmallLoading';
import { Aux, Background } from '../../Components';
import classes from './resetPassword.css';

import auth from '../../utils/auth';

class ResetPassword extends Component {
  state = {
    isVerifyingToken: false,
    tokenErrorMessage: null,
    verifiedToken: null,
    isTokenValid: false,
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
      .validateResetPasswordToken(token)
      .then(res => {
        const { isValid, info } = res.data;
        if (isValid) {
          this.setState({
            verifiedToken: token,
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
          tokenErrorMessage: err.message,
        });
      });
  };

  render() {
    const {
      isVerifyingToken,
      verifiedToken,
      tokenErrorMessage,
      isTokenValid,
    } = this.state;

    const {
      loggedIn,
      connectResetPassword,
      connectClearError,
      loading,
      errorMessage,
    } = this.props;

    if (loggedIn) {
      return <Redirect to="/myVMT/rooms" />;
    }

    if (isTokenValid) {
      return (
        <ResetPasswordLayout
          token={verifiedToken}
          resetPassword={connectResetPassword}
          clearError={connectClearError}
          loading={loading}
          errorMessage={errorMessage}
        />
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
          <Link to="/forgotPassword">Request Password Reset Link</Link>
        </div>
      </Aux>
    );
  }
}

ResetPassword.propTypes = {
  match: PropTypes.shape({}).isRequired,
  loggedIn: PropTypes.bool.isRequired,
  connectClearError: PropTypes.func.isRequired,
  connectResetPassword: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  errorMessage: PropTypes.string,
};

ResetPassword.defaultProps = {
  loading: false,
  errorMessage: null,
};

const mapStateToProps = store => {
  return {
    loggedIn: store.user.loggedIn,
    errorMessage: store.loading.errorMessage,
    loading: store.loading.loading,
  };
};

export default connect(
  mapStateToProps,
  { connectResetPassword: resetPassword, connectClearError: clearError }
)(ResetPassword);
