/* eslint-disable jsx-a11y/label-has-for */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Redirect, Link } from 'react-router-dom';
import { TextInput, Button, RadioBtn, Background, Aux } from '../../Components';
import classes from './signup.css';
import GoogleLogin from '../../Components/Form/Google/LoginButton';

class Signup extends Component {
  // @TODO Redo Login containers state to match this. cleaner
  // @TODO dispatch an action to clear error message when user starts typing again
  state = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    participantAccount: true,
  };

  componentDidMount() {
    const { temp, user } = this.props;
    if (temp && user) {
      this.setState({ username: user.username });
    }
    window.addEventListener('keypress', this.onKeyPress);
  }

  componentDidUpdate(prevProps) {
    const { tempRoom, loggedIn, closeModal } = this.props;
    if (tempRoom && !prevProps.loggedIn && loggedIn) {
      closeModal();
    }
  }

  componentWillUnmount() {
    const { errorMessage, clearError } = this.props;
    if (errorMessage) {
      clearError();
    }
    window.removeEventListener('keypress', this.onKeyPress);
  }
  // pass to text inputs to update state from user input
  changeHandler = (event) => {
    const updatedState = { ...this.state };
    updatedState[event.target.name] = event.target.value;
    this.setState(updatedState);
  };

  onKeyPress = (event) => {
    const { errorMessage, clearError } = this.props;
    if (event.key === 'Enter') {
      this.signUp();
    }
    if (errorMessage) {
      clearError();
    }
  };
  signUp = () => {
    const { temp, room, signup, user } = this.props;
    const {
      participantAccount,
      firstName,
      lastName,
      username,
      email,
      password,
    } = this.state;
    const accountType = participantAccount ? 'participant' : 'facilitator';
    const newUser = {
      firstName,
      lastName,
      username,
      email,
      password,
      accountType,
    };
    if (temp) {
      newUser._id = user._id;
      newUser.rooms = [room];
    }
    console.log('Signing up user: ', newUser);
    signup(newUser);
  };

  render() {
    const { user, temp, loggedIn, errorMessage } = this.props;
    const {
      participantAccount,
      username,
      firstName,
      lastName,
      email,
      password,
    } = this.state;
    const containerClass = temp
      ? classes.ModalContainer
      : classes.SignupContainer;

    const initialValue = user ? user.username : '';
    return (
      // after creating a user redirect to login @TODO figure out if this is for creating participants or for signing up on your own
      // the answer will determine where/if we redirect to
      loggedIn && !temp ? (
        <Redirect to="/myVMT/rooms" />
      ) : (
        <Aux>
          {!temp ? <Background bottomSpace={-40} fixed /> : null}
          <div className={classes.Container}>
            <div className={containerClass}>
              <h2 className={classes.Title}>Signup</h2>
              <GoogleLogin />
              <div>or</div>
              <form className={classes.Form}>
                <TextInput
                  light={temp}
                  change={this.changeHandler}
                  type="text"
                  label="First Name"
                  value={firstName}
                  name="firstName"
                />
                <TextInput
                  light={temp}
                  change={this.changeHandler}
                  type="text"
                  label="Last Name"
                  value={lastName}
                  name="lastName"
                />
                <TextInput
                  light={temp}
                  change={this.changeHandler}
                  type="text"
                  label="Username"
                  name="username"
                  value={username.length > 0 ? username : initialValue}
                />
                <TextInput
                  light={temp}
                  change={this.changeHandler}
                  type="email"
                  label="Email"
                  value={email}
                  name="email"
                />
                <TextInput
                  light={temp}
                  change={this.changeHandler}
                  type="password"
                  label="Password"
                  value={password}
                  name="password"
                />
                <div className={classes.AccountTypeContainer}>
                  {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                  <label className={classes.AccountTypeLabel}>
                    Account Type
                  </label>
                  <div className={classes.RadioOption}>
                    <RadioBtn
                      checked={participantAccount}
                      name="participant"
                      check={() => this.setState({ participantAccount: true })}
                    >
                      Participant
                    </RadioBtn>
                  </div>
                  <div className={classes.RadioOption}>
                    <RadioBtn
                      checked={!participantAccount}
                      name="facilitator"
                      check={() => this.setState({ participantAccount: false })}
                    >
                      Facilitator
                    </RadioBtn>
                  </div>
                </div>
                <p className={classes.AccountMessage}>
                  *Note: This just marks your primary account type, you can
                  still be a participant in some scenarios and a facilitator in
                  others without making separate accounts.
                </p>
                <Link
                  data-testid="login-link-code"
                  className={classes.Link}
                  to="/classcode"
                >
                  Have a Class Code?{' '}
                </Link>

                <div className={classes.ErrorMsg}>
                  <div className={classes.Error}>{errorMessage}</div>
                </div>
              </form>
              <div className={classes.Submit}>
                <Button
                  type=""
                  theme={temp ? 'Small' : 'Big'}
                  data-testid="submit-signup"
                  click={this.signUp}
                >
                  Signup
                </Button>
              </div>
            </div>
          </div>
        </Aux>
      )
    );
  }
}

Signup.propTypes = {
  temp: PropTypes.bool,
  room: PropTypes.string,
  signup: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
  tempRoom: PropTypes.bool,
  errorMessage: PropTypes.string,
  clearError: PropTypes.func.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  closeModal: (props, propName) => {
    if (props.temp && !props[propName]) {
      throw new Error(
        'please provide a function to close the signup modal when props.temp is true'
      );
    }
  },
};

Signup.defaultProps = {
  room: null,
  user: null,
  errorMessage: null,
  temp: false,
  tempRoom: false,
  closeModal: null,
};

export default Signup;
