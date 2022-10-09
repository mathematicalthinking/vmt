import * as actionTypes from './actionTypes';
import AUTH from '../../utils/auth';
import { normalize, addUserRoleToResource } from '../utils';
import API from '../../utils/apiRequests';
import * as loading from './loading';
import { gotCourses } from './courses';
import { gotRooms } from './rooms';
import { gotActivities, addUserActivities } from './activities';

import {
  validateForgotPassword,
  validateResetPassword,
} from '../../utils/validators';

export const gotUser = (user, temp) => {
  let loggedIn = true;
  if (temp) loggedIn = false;
  return {
    type: actionTypes.GOT_USER,
    user,
    loggedIn,
  };
};

export const updateUser = (body) => {
  return {
    type: actionTypes.UPDATE_USER,
    body,
  };
};

export const loggedOut = () => {
  return { type: actionTypes.LOGOUT };
};

export const logout = () => {
  // N.B., We are not disconnecting the user from the websocket
  // becasue they need to be connected if they go into a temporary room
  // But we don't want them to continue to receive notifications for the previously
  // logged in user, so we need to do disassociate their socketId and userId
  // send their userId to the logout function and clear the socketId on the user model
  // on the backend
  return (dispatch, getState) => {
    const userId = getState().user._id;
    AUTH.logout(userId)
      .then(() => {
        dispatch(loggedOut());
      })
      .catch((err) => dispatch(loading.fail(err)));
  };
};

export const addUserCourseTemplates = (newTemplate) => {
  return {
    type: actionTypes.ADD_USER_COURSE_TEMPLATES,
    newTemplate,
  };
};

export const addNotification = (ntf) => {
  return {
    type: actionTypes.ADD_NOTIFICATION,
    ntf,
  };
};

// user is requesting user? // @TODO rename this CLEARED
export const removeNotification = (ntfId) => {
  return {
    type: actionTypes.REMOVE_NOTIFICATION,
    ntfId,
  };
};

export const toggleJustLoggedIn = () => {
  return {
    type: actionTypes.TOGGLE_JUST_LOGGED_IN,
  };
};

export const updateUserResource = (resource, resourceId, userId) => {
  return (dispatch) => {
    API.addUserResource(resource, resourceId, userId)
      .then(() => {
        dispatch(addUserActivities([resourceId])); // <-- this seems like it should be dynamic...rooms/courses/activities
      })
      .catch((err) => dispatch(loading.fail(err)));
  };
};

// For clearing notifications after the user has seen it. As opposed to request for access notifications which are cleared
// when the user explicitly grants access (see actions.access)
export const clearNotification = (ntfId) => {
  return (dispatch) => {
    dispatch(removeNotification(ntfId));
    // API.removeNotification(ntfId, userId, requestingUser, resource, ntfType)
    API.put('notifications', ntfId, { isTrashed: true })
      .then(() => {
        // dispatch(gotUser(res.data))
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err));
  };
};

/**
 * Signup and Login now accept a 'special' flag. This flag
 * tells the server that the user is being allowed to signup or login without
 * a password. The server will then create the user (signup) or connect with
 * the default password specified in the server/.env file.
 */
export const signup = (body, special = false) => {
  // room is optional -- if we're siging up someone in a temp room
  const signupFn = special ? AUTH.signupSpecial : AUTH.signup;
  return (dispatch) => {
    // if (room) {
    //   // dispatch(updateRoomMembers(room, {user:{username: body.username, _id: body._id}, role: 'facilitator'}))
    // }
    dispatch(loading.start());
    signupFn(body)
      .then((res) => {
        if (res.data.errorMessage) {
          return dispatch(loading.fail(res.data.errorMessage));
        }
        if (res.data.courses.length > 0) {
          dispatch(getUser(res.data._id));
          return dispatch(loading.success());
        }
        dispatch(gotUser(res.data));
        return dispatch(loading.success());
      })
      .catch((err) => {
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

// When we are signing up several people at once. Need to use this so that we can aggregate any errors.
export const signupMultiple = (bodies) => {
  return (dispatch) => {
    const messages = [];
    let success = true;
    dispatch(loading.start());
    bodies.foreach((body) => {
      AUTH.signup(body)
        .then((res) => {
          if (res.data.errorMessage) {
            messages.push({ body, fail: res.data.errorMessage });
            success = false;
          } else {
            messages.push({ body, success: true });
          }
        })
        .catch((err) => {
          messages.push({ body, fail: err.response.data.errorMessage });
          success = false;
        });
    });
    if (success) {
      dispatch(loading.success());
    } else {
      dispatch(loading.multiFail(messages));
    }
  };
};

export const login = (username, password, special = false) => {
  const loginFn = special ? AUTH.loginSpecial : AUTH.login;
  return (dispatch) => {
    dispatch(loading.start());
    loginFn(username, password)
      .then((res) => {
        if (res.data.errorMessage) {
          return dispatch(loading.fail(res.data.errorMessage));
        }
        let courses;
        let rooms;
        if (res.data.courses.length > 0) {
          const coursesWithRoles = res.data.courses.map((course) =>
            addUserRoleToResource(course, res.data._id)
          );
          courses = normalize(coursesWithRoles);
          // const activities = normalize(res.data.activities)
          dispatch(gotCourses(courses));
        }
        if (res.data.rooms.length > 0) {
          const roomsWithRoles = res.data.rooms.map((room) =>
            addUserRoleToResource(room, res.data._id)
          );
          rooms = normalize(roomsWithRoles);
          dispatch(gotRooms(rooms));
        }

        const activities = normalize(res.data.activities);
        dispatch(gotActivities(activities));

        const user = {
          ...res.data,
          courses: courses ? courses.allIds : [],
          rooms: rooms ? rooms.allIds : [],
          activities: activities ? activities.allIds : [],
        };
        dispatch(gotUser(user));
        return dispatch(loading.success());
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const getUser = (id) => {
  return (dispatch) => {
    dispatch(loading.start());
    const resolvedUser =
      id === undefined ? AUTH.currentUser() : API.getById('user', id);
    resolvedUser
      .then((res) => {
        const currentUser = res.data.result;

        if (res.data.errorMessage) {
          dispatch(logout());
          return dispatch(loading.fail(res.data.errorMessage));
        }
        let courses;
        let rooms;
        let activities;

        if (currentUser) {
          if (currentUser.courses.length > 0) {
            const coursesWithRoles = currentUser.courses.map((course) =>
              addUserRoleToResource(course, currentUser._id)
            );
            courses = normalize(coursesWithRoles);
            // const activities = normalize(currentUser.activities)
            dispatch(gotCourses(courses));
          }
          if (currentUser.rooms.length > 0) {
            const roomsWithRoles = currentUser.rooms.map((room) =>
              addUserRoleToResource(room, currentUser._id)
            );
            rooms = normalize(roomsWithRoles);
            dispatch(gotRooms(rooms));
          }

          activities = normalize(currentUser.activities);
          dispatch(gotActivities(activities));

          const user = {
            ...res.data.result,
            courses: courses ? courses.allIds : [],
            rooms: rooms ? rooms.allIds : [],
            activities: activities ? activities.allIds : [],
          };
          dispatch(gotUser(user));
        } else {
          // no user is logged in
          // can we check if user is still set to loggedIn in store?
          dispatch(loading.fail('No user logged in'));
          dispatch(loggedOut());
        }

        return dispatch(loading.success());
      })
      .catch((err) => {
        console.log('ERROR getting user- ', err);
        // if the session has expired logout
        if (err.response) {
          if (err.response.data.errorMessage === 'Not Authorized') {
            dispatch(logout());
          }
          dispatch(loading.fail(err.response.data.errorMessage));
        } else {
          dispatch(loading.fail(`Error getting user - ${err}`));
        }
      });
  };
};

export const googleLogin = (username, password) => {
  return (dispatch) => {
    dispatch(loading.start());
    AUTH.googleLogin(username, password)
      .then((res) => {
        dispatch(loading.success(res));
      })
      .catch((err) => {
        dispatch(loading.fail(err));
      });
  };
};

export const codeLogin = (resource, code) => {
  return (dispatch) => {
    dispatch(loading.start());
    API.getWithCode(resource, code)
      .then((res) => {
        dispatch(loading.success(res));
      })
      .catch((err) => {
        dispatch(loading.fail(err));
      });
  };
};

export const clearError = () => {
  return { type: actionTypes.CLEAR_ERROR };
};

export const forgotPassword = (email, username) => {
  return (dispatch) => {
    dispatch(loading.start());

    return validateForgotPassword(email, username).then((validationResults) => {
      const [validationErr, validatedBody] = validationResults;
      if (validationErr) {
        return dispatch(loading.fail(validationErr));
      }
      return AUTH.forgotPassword(validatedBody)
        .then((res) => {
          const { isSuccess, info } = res.data;
          if (isSuccess) {
            dispatch(loading.forgotPasswordSuccess());
          } else {
            dispatch(loading.fail(info));
          }
        })
        .catch((err) => {
          dispatch(loading.fail(err.response.data.errorMessage));
        });
    });
  };
};

export const resetPassword = (password, confirmPassword, token) => {
  return (dispatch) => {
    dispatch(loading.start());

    return validateResetPassword(password, confirmPassword, token).then(
      (validationResults) => {
        const [validationErr, validatedBody] = validationResults;
        if (validationErr) {
          return dispatch(loading.fail(validationErr));
        }

        return AUTH.resetPassword(validatedBody.password, validatedBody.token)
          .then((res) => {
            const { message } = res.data;
            if (message) {
              dispatch(loading.fail(message));
            } else {
              let courses;
              let rooms;
              if (res.data.courses.length > 0) {
                const coursesWithRoles = res.data.courses.map((course) =>
                  addUserRoleToResource(course, res.data._id)
                );
                courses = normalize(coursesWithRoles);
                dispatch(gotCourses(courses));
              }
              if (res.data.rooms.length > 0) {
                const roomsWithRoles = res.data.rooms.map((room) =>
                  addUserRoleToResource(room, res.data._id)
                );
                rooms = normalize(roomsWithRoles);
                dispatch(gotRooms(rooms));
              }

              const activities = normalize(res.data.activities);
              dispatch(gotActivities(activities));

              const user = {
                ...res.data,
                courses: courses ? courses.allIds : [],
                rooms: rooms ? rooms.allIds : [],
                activities: activities ? activities.allIds : [],
              };
              dispatch(gotUser(user));
              dispatch(loading.resetPasswordSuccess());
            }
          })
          .catch((err) => {
            dispatch(loading.fail(err.response.data.errorMessage));
          });
      }
    );
  };
};

export const confirmEmail = (token) => {
  return (dispatch) => {
    dispatch(loading.confirmEmailStart());
    return AUTH.confirmEmail(token)
      .then((res) => {
        const { isValid, info, confirmedEmail } = res.data;
        const userData = res.data.user;

        if (!isValid) {
          dispatch(loading.confirmEmailFail(info));
        } else {
          // user object will be sent back if user was logged in when the request was made
          if (userData) {
            let courses;
            let rooms;
            if (userData.courses.length > 0) {
              const coursesWithRoles = userData.courses.map((course) =>
                addUserRoleToResource(course, userData._id)
              );
              courses = normalize(coursesWithRoles);
              // const activities = normalize(userData.activities)
              dispatch(gotCourses(courses));
            }
            if (userData.rooms.length > 0) {
              const roomsWithRoles = userData.rooms.map((room) =>
                addUserRoleToResource(room, userData._id)
              );
              rooms = normalize(roomsWithRoles);
              dispatch(gotRooms(rooms));
            }

            const activities = normalize(userData.activities);
            dispatch(gotActivities(activities));

            const user = {
              ...userData,
              courses: courses ? courses.allIds : [],
              rooms: rooms ? rooms.allIds : [],
              activities: activities ? activities.allIds : [],
            };
            dispatch(gotUser(user));
          }

          dispatch(loading.confirmEmailSuccess(confirmedEmail));
        }
      })
      .catch((err) => {
        dispatch(loading.confirmEmailFail(err.message || err.errorMessage));
      });
  };
};

export const updateUserSettings = (userId, updatedSettings) => {
  return (dispatch) => {
    dispatch(updateUser(updatedSettings));
    API.put('user', userId, updatedSettings)
      .then(() => {
        // handle success?
      })
      .catch((err) => dispatch(loading.fail(err)));
  };
};
