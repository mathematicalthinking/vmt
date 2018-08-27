import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import { normalize } from '../utils/normalize';
import API from '../../utils/apiRequests';
import * as loading from './loading'
import { updateCourse, gotCourses } from './courses';
import { updateRoom, gotRooms } from './rooms';
import { gotAssignments } from './assignments';


export const gotUser = user => {
  return {
    type: actionTypes.GOT_USER,
    user,
  }
}

export const updateUserCourses = newCourse => {
  return {
    type: actionTypes.UPDATE_USER_COURSES,
    newCourse,
  }
}

export const updateUserAssignments = newAssignment => {
  return {
    type: actionTypes.UPDATE_USER_ASSIGNMENTS,
    newAssignment,
  }
}

export const updateUserRooms = newRoom => {
  return {
    type: actionTypes.UPDATE_USER_ROOMS,
    newRoom,
  }
}

export const updateUserCourseTemplates = newTemplate => {
  return {
    type: actionTypes.UPDATE_USER_COURSE_TEMPLATES,
    newTemplate,
  }
}


export const updateUserRoomTemplates = newTemplate => {
  return {
    type: actionTypes.UPDATE_USER_ROOM_TEMPLATES,
    newTemplate,
  }
}

export const signup = body => {
  return dispatch => {
    dispatch(loading.loginStart());
    auth.signup(body)
    .then(res => {
      if (res.data.errorMessage) return dispatch(loading.loginFail(res.data.errorMessage))
      dispatch(gotUser(res.data));
      dispatch(loading.loginSuccess());
    })
    .catch(err => {
      dispatch(loading.loginFail('something went wrong'))})
  }
}

export const login = (username, password) => {
  return (dispatch, getState) => {
    dispatch(loading.loginStart());
    auth.login(username, password)
    .then(res => {
      if (res.data.errorMessage) {return dispatch(loading.loginFail(res.data.errorMessage))}
      const courses = normalize(res.data.courses)
      const rooms = normalize(res.data.rooms)
      const assignments = normalize(res.data.assignments)
      dispatch(gotCourses(courses));
      dispatch(gotRooms(rooms));
      dispatch(gotAssignments(assignments));
      const user = {
        ...res.data,
        rooms: rooms.allIds,
        courses: courses.allIds,
        assignments: assignments.allIds
      }
      dispatch(gotUser(user))
      return dispatch(loading.loginSuccess());
    })
    .catch(err => {
      dispatch(loading.loginFail(err.response.statusText))
    })
  }
}

export const requestAccess = (toUser, fromUser, resource, resourceId) => {
  return dispatch => {
    dispatch(loading.requestingAccess());
    API.requestAccess(toUser, fromUser, resource, resourceId)
    .then(res => {
      return dispatch(loading.accessSuccess())
    })
    .catch(err => {
      return dispatch(loading.accessFail())})
  }
}

export const grantAccess = (user, resource, id) => {
  return dispatch => {
    API.grantAccess(user, resource, id)
    .then(res => {
      if (resource === 'room') {
        return dispatch(updateRoom(res.data.result))
      }
      // dispatch(updateUserCourses(resp.data.result)) @TODO Need to update the notifcations associated with this course
      return dispatch(updateCourse(res.data.result))
    })
  }
}

export const googleLogin = (username, password) => {
  return dispatch => {
    dispatch(loading.loginStart());
    auth.googleLogin(username, password)
    .then(res => {
      dispatch(loading.loginSuccess(res));
    })
    .catch(err => {
      dispatch(loading.loginFail(err));
    })
  }
}

export const clearError = () => {
  return {type: actionTypes.CLEAR_ERROR}
}
