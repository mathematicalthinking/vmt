import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import Button from '../../Components/UI/Button/Button';
import classes from './forgotPassword.css';
import Input from '../../Components/Form/TextInput/TextInput';
import SmallLoading from '../../Components/Loading/SmallLoading';
import Background from '../../Components/Background/Background';

class ForgotPasswordLayout extends PureComponent {
  // / Im not really a fan of how this is setup anymore
  state = {
    controls: {
      email: {
        type: 'text',
        placeholder: '',
        value: '',
        label: 'Email Address',
      },
      username: {
        type: 'text',
        placeholder: '',
        value: '',
        label: 'Username',
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
      this.forgotPasswordHandler();
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
  forgotPasswordHandler = () => {
    const { forgotPassword } = this.props;
    const { controls } = this.state;
    // event.preventDefault();
    // pass submission off to redux
    forgotPassword(controls.email.value, controls.username.value);
  };

  render() {
    const { loggedIn, errorMessage, loading, successMessage } = this.props;
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
        <div className={classes.ForgotPasswordContainer}>
          <h2 className={classes.Title}>
            Please provide the email address or username associated with your
            VMT account{' '}
          </h2>
          <form onSubmit={this.forgotPasswordHandler} className={classes.Form}>
            {form}
            <div className={classes.ErrorMsg}>
              <div className={classes.Error}>{errorMessage}</div>
            </div>
            <div className={classes.SuccessMsg}>
              <div className={classes.Success}>{successMessage}</div>
            </div>
          </form>
          <div className={classes.Submit}>
            {loading ? (
              <SmallLoading />
            ) : (
              <Button click={this.forgotPasswordHandler} theme="Big">
                Request Reset Link
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

ForgotPasswordLayout.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
  clearError: PropTypes.func.isRequired,
  forgotPassword: PropTypes.func.isRequired,
  successMessage: PropTypes.string,
};

ForgotPasswordLayout.defaultProps = {
  loading: false,
  errorMessage: null,
  successMessage: null,
};
export default ForgotPasswordLayout;
