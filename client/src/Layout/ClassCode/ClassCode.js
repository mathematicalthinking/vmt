/* eslint-disable react/no-unused-prop-types */
/* eslint-disable prefer-destructuring */

import React, { useEffect, useState, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Redirect } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useDispatch } from 'react-redux';
import { API } from 'utils';
import {
  TextInput,
  Button,
  Background,
  Aux,
  Modal,
  ClassList,
} from '../../Components';
import classes from './classcode.css';
import GoogleLogin from '../../Components/Form/Google/LoginButton';

function ClassCode(props) {
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resource, setResource] = useState({});
  const [isResourceConf, setIsResourceConf] = useState(false);
  const [memberToConf, setMemberToConf] = useState({});
  const dispatch = useDispatch();

  useEffect(() => {
    const { clearError } = props;

    return () => {
      if (errorMessage) {
        setErrorMessage('');
        clearError();
      }
    };
  }, []);

  useEffect(() => {
    if (errorMessage && code === '') reset();
  }, [code]);

  const { isSuccess, data } = useQuery(
    code,
    () =>
      API.getWithCode('courses', code).then((res) => {
        const { members } = res.data.result[0];
        return members;
      }),
    { enabled: isResourceConf, refreshInterval: 1000 }
  );

  const members = isSuccess ? data : [];

  const participantList = [];
  members.forEach((member) => {
    if (member.role !== 'facilitator') {
      participantList.push(member);
    }
  });

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
            setErrorMessage('');
            setResource(res.data.result[0]);
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
    setIsResourceConf(false);
    setMemberToConf({});
  };

  const join = (user) => {
    // const user = members.find(
    //   (mem) => mem.user.username.toLowerCase() === member.username.toLowerCase()
    // ).user;
    setMemberToConf(user);
    window.scrollTo(0, 0);
  };

  const handleLogin = () => {
    const { signup, login, history } = props;

    if (memberToConf.user.accountType === 'pending') {
      const userToConvert = {
        accountType: 'participant',
        email: memberToConf.user.email || '',
        firstName: memberToConf.user.firstName,
        lastName: memberToConf.user.lastName,
        // password: process.env.REACT_APP_VMT_LOGIN_DEFAULT,
        rooms: memberToConf.user.rooms,
        courses: memberToConf.user.courses,
        username: memberToConf.user.username,
        _id: memberToConf.user._id,
      };

      signup(userToConvert, true); // 'true' indicates that the user will not be required to login with a password.
    } else if (!memberToConf.user.isGmail) {
      login(
        memberToConf.user.username,
        'dummy',
        true // flag indicating that the user may login without a password.
        // process.env.REACT_APP_VMT_LOGIN_DEFAULT
      );
    } else {
      history.push('/login');
    }
  };

  const memberConfirmMessage = (memInfo) => {
    if (!memInfo.user) return null;
    const currentMember = members.find(
      (mem) => mem.user._id === memInfo.user._id
    );

    if (!currentMember) return null;
    if (currentMember.user.socketId) {
      return (
        <div className={classes.ErrorMsg}>
          User has an active session - Are you sure you want to continue?
        </div>
      );
    }
    if (currentMember.user.accountType === 'pending') {
      return (
        <div>
          {`${currentMember.user.username} has not been claimed yet, 
          continue to claim this account`}
        </div>
      );
    }
    return <div>Welcome back to VMT!</div>;
  };

  const { temp, loggedIn, errorMessage: systemError } = props;
  const isGoogleUser = memberToConf.user ? memberToConf.user.isGmail : false;

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
            {isResourceConf ? (
              <div>
                <ClassList members={participantList} join={join} />
                <Button theme="SmallCancel" click={reset}>
                  Try a different code
                </Button>
              </div>
            ) : (
              <Fragment>
                <div className={classes.Form} onSubmit={courseSearch}>
                  <TextInput
                    light={temp}
                    change={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        courseSearch(e);
                      } else setCode(e.target.value);
                    }}
                    type="text"
                    label="Code"
                    value={code}
                    name="code"
                    autoComplete="off"
                  />
                  <div className={classes.ErrorMsg}>
                    <div className={classes.Error}>{errorMessage}</div>
                  </div>
                </div>
                <div className={classes.Submit}>
                  <Button
                    type=""
                    theme="Big"
                    data-testid="submit-code"
                    click={courseSearch}
                  >
                    Enter
                  </Button>
                </div>
              </Fragment>
            )}
            <Modal
              show={Object.keys(resource).length && !isResourceConf}
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
              show={!!memberToConf.user} // might be undefined
              closeModal={() => {
                setMemberToConf({});
              }}
            >
              <Fragment>
                <div className={classes.Modal}>
                  {memberConfirmMessage(memberToConf)}
                  {memberToConf.user
                    ? `Are you ${memberToConf.user.username}?`
                    : ''}
                </div>
                <div>
                  <Button
                    m={10}
                    click={() => {
                      setMemberToConf({});
                    }}
                  >
                    No, this isn&apos;t me
                  </Button>
                  {}
                  {isGoogleUser ? (
                    <div
                      tabIndex={-1}
                      role="button"
                      onKeyDown={() => {
                        // send user email to redux store so that oauthreturn can check if it is the same email that was clicked on in google oauth
                        dispatch({
                          type: 'STORE_PRESUMPTIVE_GMAIL',
                          payload: {
                            presumptiveEmailAddress: memberToConf.user.email,
                          },
                        });
                      }}
                      onClick={() => {
                        // send user email to redux store so that oauthreturn can check if it is the same email that was clicked on in google oauth
                        dispatch({
                          type: 'STORE_PRESUMPTIVE_GMAIL',
                          payload: {
                            presumptiveEmailAddress: memberToConf.user.email,
                          },
                        });
                      }}
                    >
                      Yes, log in with Google <GoogleLogin />{' '}
                    </div>
                  ) : (
                    <Button m={10} click={handleLogin}>
                      Yes, let&apos;s go
                    </Button>
                  )}
                </div>
                <div className={classes.ErrorMsg}>
                  {systemError !== '' && (
                    <div className={classes.Error}>{systemError}</div>
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
  history: PropTypes.shape({ push: PropTypes.func }).isRequired,
};

ClassCode.defaultProps = {
  room: null,
  user: null,
  errorMessage: null,
  temp: false,
  // closeModal: null,
};

export default ClassCode;
