/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable */

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { API } from 'utils';
import { TextInput, Button, Background, Aux, Modal } from '../../Components';
import classes from './classcode.css';
import GoogleLogin from '../../Components/Form/Google/LoginButton';

class ClassCode extends Component {
  // @TODO Redo Login containers state to match this. cleaner
  // @TODO dispatch an action to clear error message when user starts typing again
  constructor(props) {
    super(props);

    this.state = {
      code: '',
      errorMessage: '',
      participantAccount: true,
      resource: {},
      members: [],
      isResourceConf: false,
      memberToConf: null,
    };

    this.reset = this.reset.bind(this);
    this.confirmResource = this.confirmResource.bind(this);
    this.handleLogin = this.handleLogin.bind(this);
  }

  componentDidMount() {
    const { temp, user } = this.props;
    if (temp && user) {
      this.setState({ username: user.username });
    }
    window.addEventListener('keypress', this.onKeyPress);
  }

  componentDidUpdate(prevProps) {
    const { code } = this.state;
    if (prevProps.code && code === '') this.reset();
  }

  componentWillUnmount() {
    const { errorMessage, clearError } = this.props;
    if (errorMessage) {
      this.setState({ errorMessage: '' });
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
    // const { errorMessage, clearError } = this.props;
    if (event.key === 'Enter') {
      this.courseSearch();
    }
    // if (errorMessage) {
    //   clearError();
    //   this.setState({ errorMessage: '' });
    // }
  };

  courseSearch = (e) => {
    if (e) e.preventDefault();
    const { code } = this.state;
    if (!code) {
      this.setState({ errorMessage: 'Please enter a class code' });
    } else {
      API.getWithCode('courses', code)
        .then((res) => {
          if (res.data.result.length < 1) {
            this.setState({ errorMessage: 'Invalid Course Code' });
          } else {
            this.setState({ resource: res.data.result[0] });
            this.setState({ members: res.data.result[0].members });
            this.setState({ errorMessage: '' });
          }
        })
        .catch((err) => {
          this.setState({ errorMessage: err.response.data.errorMessage });
          console.log('API err: ', err);
        });
    }
  };

  confirmResource() {
    this.setState({ isResourceConf: true });
  }

  reset() {
    this.setState({
      isResourceConf: false,
      code: '',
      resource: {},
      members: [],
      errorMessage: '',
      memberToConf: null,
    });
  }

  join(member) {
    const { members } = this.state;
    const user = members.find(
      (mem) => mem.user.username.toLowerCase() === member.username.toLowerCase()
    ).user;
    this.setState({ memberToConf: user });
    window.scrollTo(0, 0);
  }

  handleLogin() {
    const { signup, login, history } = this.props;
    const { memberToConf } = this.state;

    if (memberToConf.accountType === 'pending') {
      const userToConvert = {
        accountType: 'participant',
        email: memberToConf.email || '',
        firstName: memberToConf.firstName,
        lastName: memberToConf.lastName,
        password: process.env.REACT_APP_VMT_LOGIN_DEFAULT,
        rooms: memberToConf.rooms,
        courses: memberToConf.courses,
        username: memberToConf.username,
        _id: memberToConf._id,
      };

      // console.log('signing up user: ', userToConvert);
      signup(userToConvert);
    } else if (!memberToConf.isGmail) {
      login(memberToConf.username, process.env.REACT_APP_VMT_LOGIN_DEFAULT);
    } else {
      history.push('/login');
    }
  }

  render() {
    const { temp, loggedIn } = this.props;
    const {
      code,
      errorMessage,
      resource,
      isResourceConf,
      members,
      memberToConf,
    } = this.state;
    const isGoogleUser = memberToConf ? memberToConf.isGmail : false;
    const participantList = [];
    members.forEach((member) => {
      if (member.role === 'participant' || member.role === 'guest') {
        participantList.push(member);
      }
    });
    return (
      // after creating a user redirect to login @TODO figure out if this is for creating participants or for signing up on your own
      // the answer will determine where/if we redirect to
      loggedIn && !temp ? (
        <Redirect to="/myVMT/courses" />
      ) : (
        <Aux>
          <Background bottomSpace={-40} fixed />
          <div className={classes.Container}>
            <div className={classes.SignupContainer}>
              <h2 className={classes.Title}>Enter with Code</h2>
              {members.length > 0 && isResourceConf ? (
                <Fragment>
                  <div className={classes.THead}>Member List</div>
                  <table className={classes.ParticipantList}>
                    <thead>
                      <tr>
                        <th className={classes.THead}>Username</th>
                        {/* <th>Name</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {participantList.map((member, i) => {
                        return (
                          <tr
                            className={classes.Participant}
                            key={member.user._id}
                            id={member.user._id}
                          >
                            <td>{`${i +
                              1}. Username: ${member.user.username.toLowerCase()}`}</td>
                            <td>
                              {' '}
                              <Button
                                m={0}
                                theme="Small"
                                click={() => this.join(member.user)}
                              >
                                Join{' '}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <Button m={0} theme="SmallCancel" click={this.reset}>
                    Try a different code
                  </Button>
                </Fragment>
              ) : (
                <Fragment>
                  <form className={classes.Form} onSubmit={this.courseSearch}>
                    <TextInput
                      light={temp}
                      change={this.changeHandler}
                      type="text"
                      label="Code"
                      value={code}
                      name="code"
                      autoComplete="off"
                    />
                    <div className={classes.ErrorMsg}>
                      <div className={classes.Error}>{errorMessage}</div>
                    </div>
                  </form>
                  <div className={classes.Submit}>
                    <Button
                      type=""
                      theme="Big"
                      data-testid="submit-signup"
                      click={this.courseSearch}
                    >
                      Enter
                    </Button>
                  </div>
                </Fragment>
              )}
              <Modal
                show={members.length > 0 && !isResourceConf}
                closeModal={this.reset}
              >
                <div className={classes.Modal}>
                  {' '}
                  Do you want to join this resource?
                </div>

                <Fragment>
                  <div className={classes.Modal}>{`Name: ${
                    resource.name
                  }`}</div>
                  <p className={classes.Modal}>{resource.description}</p>
                  <div>
                    <Button m={10} click={this.reset}>
                      No, take me back
                    </Button>
                    <Button m={10} click={this.confirmResource}>
                      Yes, looks right
                    </Button>
                  </div>
                </Fragment>
              </Modal>
              <Modal
                show={memberToConf}
                closeModal={() => {
                  this.setState({ memberToConf: null });
                }}
              >
                <div className={classes.Modal}> Confirmation </div>

                <Fragment>
                  <div className={classes.Modal}>
                    {memberToConf ? `Username: ${memberToConf.username}` : ''}
                  </div>
                  <div>
                    <Button
                      m={10}
                      click={() => {
                        this.setState({ memberToConf: null });
                      }}
                    >
                      No, this isn't me
                    </Button>
                    {}
                    {isGoogleUser ? (
                      <Fragment>
                        Yes, log in with Google <GoogleLogin />{' '}
                      </Fragment>
                    ) : (
                      <Button m={10} click={this.handleLogin}>
                        Yes, let's go
                      </Button>
                    )}
                  </div>
                </Fragment>
              </Modal>
            </div>
          </div>
        </Aux>
      )
    );
  }
}

ClassCode.propTypes = {
  temp: PropTypes.bool,
  room: PropTypes.string,
  signup: PropTypes.func.isRequired,
  login: PropTypes.func.isRequired,
  user: PropTypes.shape({}),
  errorMessage: PropTypes.string,
  clearError: PropTypes.func.isRequired,
  loggedIn: PropTypes.bool.isRequired,
  history: PropTypes.shape({}).isRequired,
};

ClassCode.defaultProps = {
  room: null,
  user: null,
  errorMessage: null,
  temp: false,
  // closeModal: null,
};

export default ClassCode;
