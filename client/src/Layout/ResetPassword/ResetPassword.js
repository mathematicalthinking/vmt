import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import Button from '../../Components/UI/Button/Button';
import classes from './resetPassword.css';
import Input from '../../Components/Form/TextInput/TextInput';
import SmallLoading from '../../Components/Loading/SmallLoading';
import Background from '../../Components/Background/Background';

class ResetPasswordLayout extends PureComponent {
  // / Im not really a fan of how this is setup anymore
  state = {
    controls: {
      password: {
        type: 'password',
        placeholder: '',
        value: '',
        label: 'New Password',
      },
      confirmPassword: {
        type: 'password',
        placeholder: '',
        value: '',
        label: 'Confirm New Password',
      },
    },
  };

  componentDidMount() {
    window.addEventListener('keypress', this.onKeyPress);
  }

  componentWillUnmount() {
    const { errorMessage, clearError } = this.props;
    if (errorMessage) {
      clearError();
    }
    window.removeEventListener('keypress', this.onKeyPress);
  }

  onKeyPress = event => {
    if (event.key === 'Enter') {
      this.resetPasswordHandler();
    }
  };

  // pass to text inputs to update state from user input
  changeHandler = event => {
    const { errorMessage, clearError } = this.props;
    const { controls } = this.state;
    const updatedControls = { ...controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    });
    // if there's an error message from a previous request clear it.
    if (errorMessage) {
      clearError();
    }
  };

  // submit form
  resetPasswordHandler = () => {
    const { resetPassword, token } = this.props;
    const { controls } = this.state;
    // pass submission off to redux
    resetPassword(
      controls.password.value,
      controls.confirmPassword.value,
      token
    );
  };

  render() {
    const { loggedIn, errorMessage, loading } = this.props;
    const { controls } = this.state;

    // TODO: Add or between email and username fields
    const formElements = Object.keys(controls);
    const form = formElements.map(formElement => {
      const elem = { ...controls[formElement] };
      return (
        <Input
          key={formElement}
          type={elem.type}
          name={formElement}
          placeholder={elem.placeholder}
          value={elem.value}
          change={this.changeHandler}
          label={elem.label}
        />
      );
    });
    if (loggedIn) {
      return <Redirect to="/myVMT/rooms" />;
    }
    return (
      <div className={classes.Container}>
        <Background bottomSpace={-60} fixed />
        <div className={classes.ResetPasswordContainer}>
          <h2 className={classes.Title}>
            Please enter and confirm your new password
          </h2>
          <form onSubmit={this.resetPasswordHandler} className={classes.Form}>
            {form}
            <div className={classes.ErrorMsg}>
              <div className={classes.Error}>{errorMessage}</div>
            </div>
          </form>
          <div className={classes.Submit}>
            {loading ? (
              <SmallLoading />
            ) : (
              <Button click={this.resetPasswordHandler} theme="Big">
                Reset Password
              </Button>
            )}
          </div>
          <Link
            data-testid="forgot-link-login"
            className={classes.Link}
            to="/login"
          >
            Back to Login{' '}
          </Link>
        </div>
      </div>
    );
  }
}

ResetPasswordLayout.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
  clearError: PropTypes.func.isRequired,
  resetPassword: PropTypes.func.isRequired,
  token: PropTypes.string.isRequired,
};

ResetPasswordLayout.defaultProps = {
  loading: false,
  errorMessage: null,
};
export default ResetPasswordLayout;
