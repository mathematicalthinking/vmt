import * as actionTypes from './actionTypes';
import AUTH from '../../utils/auth';
import { normalize, addUserRoleToResource } from '../utils';
import API from '../../utils/apiRequests';
import * as loading from './loading';
import { gotCourses } from './courses';
import { gotRooms } from './rooms';
import { gotActivities } from './activities';

export const gotUser = (user, temp) => {
  let loggedIn = true;
  if (temp) loggedIn = false;
  return {
    type: actionTypes.GOT_USER,
    user,
    loggedIn,
  };
};

export const updateUser = body => {
  return {
    type: actionTypes.UPDATE_USER,
    body,
  };
};

export const removeUserCourse = courseId => {
  return {
    type: actionTypes.REMOVE_USER_COURSE,
    courseId,
  };
};

export const addUserCourses = newCoursesArr => {
  return {
    type: actionTypes.ADD_USER_COURSES,
    newCoursesArr,
  };
};

export const addUserActivities = newActivitiesArr => {
  return {
    type: actionTypes.ADD_USER_ACTIVITIES,
    newActivitiesArr,
  };
};

export const removeUserActivities = activityIdsArr => {
  return {
    type: actionTypes.REMOVE_USER_ACTIVITIES,
    activityIdsArr,
  };
};

export const addUserRooms = newRoomsArr => {
  return {
    type: actionTypes.ADD_USER_ROOMS,
    newRoomsArr,
  };
};

export const removeUserRooms = roomIdsArr => {
  return {
    type: actionTypes.REMOVE_USER_ROOMS,
    roomIdsArr,
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
    let userId = getState().user._id;
    AUTH.logout(userId)
      .then(res => {
        dispatch(loggedOut());
      })
      .catch(err => dispatch(loading.fail(err)));
  };
};

export const addUserCourseTemplates = newTemplate => {
  return {
    type: actionTypes.ADD_USER_COURSE_TEMPLATES,
    newTemplate,
  };
};

export const addNotification = ntf => {
  return {
    type: actionTypes.ADD_NOTIFICATION,
    ntf,
  };
};

// user is requesting user? // @TODO rename this CLEARED
export const removeNotification = ntfId => {
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
  return dispatch => {
    API.addUserResource(resource, resourceId, userId)
      .then(res => {
        dispatch(addUserActivities([resourceId]));
      })
      .catch(err => dispatch(loading.fail(err)));
  };
};

// For clearing notifications after the user has seen it. As opposed to request for access notifications which are cleared
// when the user explicitly grants access (see actions.access)
export const clearNotification = ntfId => {
  return dispatch => {
    console.log('removing notficaiton');
    dispatch(removeNotification(ntfId));
    // API.removeNotification(ntfId, userId, requestingUser, resource, ntfType)
    API.put('notifications', ntfId, { isTrashed: true })
      .then(res => {
        // dispatch(gotUser(res.data))
      })
      .catch(err => console.log(err));
  };
};

export const signup = (body, room) => {
  // room is optional -- if we're siging up someone in a temp room
  return (dispatch, getState) => {
    if (room) {
      // dispatch(updateRoomMembers(room, {user:{username: body.username, _id: body._id}, role: 'facilitator'}))
    }
    dispatch(loading.start());
    AUTH.signup(body)
      .then(res => {
        if (res.data.errorMessage)
          return dispatch(loading.fail(res.data.errorMessage));
        dispatch(gotUser(res.data));
        dispatch(loading.success());
      })
      .catch(err => {
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const login = (username, password) => {
  return (dispatch, getState) => {
    dispatch(loading.start());
    AUTH.login(username, password)
      .then(res => {
        if (res.data.errorMessage) {
          return dispatch(loading.fail(res.data.errorMessage));
        }
        let courses;
        let rooms;
        if (res.data.courses.length > 0) {
          let coursesWithRoles = res.data.courses.map(course =>
            addUserRoleToResource(course, res.data._id)
          );
          courses = normalize(coursesWithRoles);
          // const activities = normalize(res.data.activities)
          dispatch(gotCourses(courses));
        }
        if (res.data.rooms.length > 0) {
          let roomsWithRoles = res.data.rooms.map(room =>
            addUserRoleToResource(room, res.data._id)
          );
          rooms = normalize(roomsWithRoles);
          dispatch(gotRooms(rooms));
        }

        let activities = normalize(res.data.activities);
        dispatch(gotActivities(activities));

        let user = {
          ...res.data,
          courses: courses ? courses.allIds : [],
          rooms: rooms ? rooms.allIds : [],
          activities: activities ? activities.allIds : [],
        };
        dispatch(gotUser(user));
        return dispatch(loading.success());
      })
      .catch(err => {
        console.log(err);
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const getUser = id => {
  return dispatch => {
    dispatch(loading.start());
    API.getById('user', id)
      .then(res => {
        let courses = normalize(res.data.result.courses);
        dispatch(gotCourses(courses));

        let rooms = normalize(res.data.result.rooms);
        dispatch(gotRooms(rooms));

        let activities = normalize(res.data.result.activities);
        dispatch(gotActivities(activities));

        let user = {
          ...res.data.result,
          courses: courses.allIds,
          activities: activities.allIds,
          rooms: rooms.allIds,
        };
        dispatch(gotUser(user));
        dispatch(loading.success());
      })
      .catch(err => {
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const googleLogin = (username, password) => {
  return dispatch => {
    dispatch(loading.start());
    AUTH.googleLogin(username, password)
      .then(res => {
        dispatch(loading.success(res));
      })
      .catch(err => {
        dispatch(loading.fail(err));
      });
  };
};

export const clearError = () => {
  return { type: actionTypes.CLEAR_ERROR };
};
