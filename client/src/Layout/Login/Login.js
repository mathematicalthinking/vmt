import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import Button from '../../Components/UI/Button/Button';
import classes from './login.css';
import Input from '../../Components/Form/TextInput/TextInput';
import SmallLoading from '../../Components/Loading/SmallLoading';
import Background from '../../Components/Background/Background';
import GoogleLogin from '../../Components/Form/Google/LoginButton';

class LoginLayout extends PureComponent {
  // / Im not really a fan of how this is setup anymore
  state = {
    controls: {
      username: {
        type: 'text',
        placeholder: '',
        value: '',
        label: 'Username',
      },
      password: {
        type: 'password',
        placeholder: '',
        value: '',
        label: 'Password',
      },
    },
    oauthErrorMessage: null,
  };

  componentDidMount() {
    window.addEventListener('keypress', this.onKeyPress);
    this.parseOauthError();
  }

  componentWillUnmount() {
    const { errorMessage, clearError } = this.props;
    if (errorMessage) {
      clearError();
    }
    window.removeEventListener('keypress', this.onKeyPress);
  }

  onKeyPress = (event) => {
    if (event.key === 'Enter') {
      this.loginHandler();
    }
  };

  // pass to text inputs to update state from user input
  changeHandler = (event) => {
    const { errorMessage, clearError } = this.props;
    const { controls, oauthErrorMessage } = this.state;
    const updatedControls = { ...controls };
    updatedControls[event.target.name].value = event.target.value;
    this.setState({
      controls: updatedControls,
    });
    // if there's an error message from a previous request clear it.
    if (errorMessage) {
      clearError();
    }
    if (oauthErrorMessage) {
      this.setState({ oauthErrorMessage: null });
    }
  };

  // submit form
  loginHandler = () => {
    const { login } = this.props;
    const { controls } = this.state;
    // event.preventDefault();
    // pass submission off to redux
    login(controls.username.value, controls.password.value);
  };

  parseOauthError = () => {
    const { href } = window.location;
    const qIndex = href.indexOf('oau');
    if (qIndex === -1) {
      return;
    }

    const queryString = href.slice(qIndex);

    const isEmailUnavailable =
      queryString.indexOf('oauthError=emailUnavailable') !== -1;

    const isSuspended = queryString.indexOf('oauthError=userSuspended') !== -1;

    if (isEmailUnavailable) {
      this.setState({
        oauthErrorMessage:
          'Email is already associated with an existing account',
      });
    } else if (isSuspended) {
      this.setState({
        oauthErrorMessage: 'Your account has been suspended',
      });
    }
  };

  render() {
    const { loggedIn, errorMessage, loading } = this.props;
    const { controls, oauthErrorMessage } = this.state;
    const formElements = Object.keys(controls);
    const form = formElements.map((formElement) => {
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
    return loggedIn ? (
      <Redirect to="/myVMT/rooms" />
    ) : (
      <div className={classes.Container}>
        <Background bottomSpace={-60} fixed />
        <div className={classes.LoginContainer}>
          <h2 className={classes.Title}>Login</h2>
          <form onSubmit={this.loginHandler} className={classes.Form}>
            {form}
            <div className={classes.ErrorMsg}>
              <div className={classes.Error}>
                {errorMessage || oauthErrorMessage}
              </div>
            </div>
          </form>
          <div className={classes.Submit}>
            {loading ? (
              <SmallLoading />
            ) : (
              <Button click={this.loginHandler} theme="Big">
                Login
              </Button>
            )}
          </div>
          <div>or</div>
          <GoogleLogin />
          <div>
            <span className={classes.AuthLinkQ}>New to VMT?</span>
            <Link
              data-testid="login-link-signup"
              className={classes.Link}
              to="/signup"
            >
              Sign Up Now
            </Link>
          </div>
          <div>
            <span className={classes.AuthLinkQ}>Forgot Password?</span>
            <Link
              data-testid="login-link-forgot"
              className={classes.Link}
              to="/forgotPassword"
            >
              Request Password Reset
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

LoginLayout.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string,
  loading: PropTypes.bool,
  clearError: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
};

LoginLayout.defaultProps = {
  loading: false,
  errorMessage: null,
};
export default LoginLayout;
