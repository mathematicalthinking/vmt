/* eslint-disable react/no-unused-prop-types */
/* eslint-disable prefer-destructuring */

import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { API } from 'utils';
import { TextInput, Button, Background, Aux, Modal } from '../../Components';
import classes from './classcode.css';
import GoogleLogin from '../../Components/Form/Google/LoginButton';

function ClassCode(props) {
  // @TODO Redo Login containers state to match this. cleaner
  // @TODO dispatch an action to clear error message when user starts typing again

  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  // const [participantAccount, setParticipantAccount] = useState(true);
  const [resource, setResource] = useState({});
  const [members, setMembers] = useState([]);
  const [isResourceConf, setIsResourceConf] = useState(false);
  const [memberToConf, setMemberToConf] = useState();

  useEffect(() => {
    const { clearError } = props;

    // what is this trying to accomplish???
    // const { temp, user } = this.props;
    // if (temp && user) {
    //   this.setState({ username: user.username });
    // }
    window.addEventListener('keypress', onKeyPress);
    return () => {
      if (errorMessage) {
        setErrorMessage('');
        clearError();
      }
      window.removeEventListener('keypress', onKeyPress);
    };
  }, []);

  useEffect(() => {
    if (errorMessage && code === '') reset();
  }, [code]);

  // const codeHandler = (input) => {
  //   setCode(input);
  // };

  const onKeyPress = (event) => {
    // const { errorMessage, clearError } = this.props;
    if (event.key === 'Enter') {
      courseSearch();
    }
  };

  const courseSearch = (e) => {
    if (e) e.preventDefault();
    if (!code) {
      setErrorMessage('Please enter a class code');
    } else {
      API.getWithCode('courses', code)
        .then((res) => {
          if (res.data.result.length < 1) {
            setErrorMessage('Invalid Course Code');
          } else {
            setResource(res.data.result[0]);
            console.log('Found members: ', res.data.result[0].members);
            setMembers(res.data.result[0].members);
            setErrorMessage('');
          }
        })
        .catch((err) => {
          setErrorMessage(err.response.data.errorMessage);
          console.log('API err: ', err);
        });
    }
  };

  const confirmResource = () => {
    setIsResourceConf(true);
  };

  const reset = () => {
    setCode('');
    setErrorMessage('');
    setResource({});
    setMembers([]);
    setIsResourceConf(false);
    setMemberToConf();
  };

  const join = (member) => {
    const user = members.find(
      (mem) => mem.user.username.toLowerCase() === member.username.toLowerCase()
    ).user;
    setMemberToConf(user);
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    const { signup, login, history } = props;

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
  };

  const isUserInSession = (userData) => {
    if (userData.user.socketId) {
      return true;
    }
    return false;
  };

  const { temp, loggedIn } = props;
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
      <Redirect to={`/myVMT/courses/${resource._id}/rooms`} />
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
                      <th className={classes.THead}>Select Your Username</th>
                      {/* <th>Name</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {participantList.map((member, i) => {
                      return (
                        <tr
                          className={
                            isUserInSession(member)
                              ? classes.InSession
                              : classes.Participant
                          }
                          key={member.user._id}
                          id={member.user._id}
                          onClick={() => join(member.user)}
                        >
                          <td>
                            {`${i +
                              1}. Username: ${member.user.username.toLowerCase()}`}
                          </td>
                          <td>
                            {isUserInSession(member) && (
                              <span>User already in session</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Button theme="SmallCancel" click={reset}>
                  Try a different code
                </Button>
              </Fragment>
            ) : (
              <Fragment>
                <form className={classes.Form} onSubmit={courseSearch}>
                  <TextInput
                    light={temp}
                    change={(e) => setCode(e.target.value)}
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
                    click={courseSearch}
                  >
                    Enter
                  </Button>
                </div>
              </Fragment>
            )}
            <Modal
              show={members.length > 0 && !isResourceConf}
              closeModal={reset}
            >
              <div className={classes.Modal}>
                {`Do you want to join ${resource.name}?`}
              </div>

              <Fragment>
                {resource.description && (
                  <p className={classes.Modal}>
                    {`Description: ${resource.description}`}
                  </p>
                )}
                <div>
                  <Button m={10} click={reset}>
                    No, take me back
                  </Button>
                  <Button m={10} click={confirmResource}>
                    Yes, looks right
                  </Button>
                </div>
              </Fragment>
            </Modal>
            <Modal
              show={!!memberToConf} // might be undefined
              closeModal={() => {
                setMemberToConf();
              }}
            >
              <Fragment>
                <div className={classes.Modal}>
                  {memberToConf ? `Are you ${memberToConf.username}?` : ''}
                </div>
                <div>
                  <Button
                    m={10}
                    click={() => {
                      setMemberToConf();
                    }}
                  >
                    No, this isn&apos;t me
                  </Button>
                  {}
                  {isGoogleUser ? (
                    <Fragment>
                      Yes, log in with Google <GoogleLogin />{' '}
                    </Fragment>
                  ) : (
                    <Button m={10} click={handleLogin}>
                      Yes, let&apos;s go
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
