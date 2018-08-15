import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import { normalize } from '../utils/normalize';
import API from '../../utils/apiRequests';

import { updateCourse, gotCourses } from './courses';
import { updateRoom, gotRooms } from './rooms';


export const updateUserCourses = newCourse => {
  console.log(newCourse)
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
  console.log("NEW ROOM: ", newRoom)
  return {
    type: actionTypes.UPDATE_USER_ROOMS,
    newRoom,
  }
}

export const updateUserCourseTemplates = newTemplate => {
  console.log(newTemplate)
  return {
    type: actionTypes.UPDATE_USER_COURSE_TEMPLATES,
    newTemplate,
  }
}

export const updateUserAssignmentTemplates = newTemplate => {
  return {
    type: actionTypes.UPDATE_USER_ASSIGNMENT_TEMPLATES,
    newTemplate,
  }
}

export const updateUserRoomTemplates = newTemplate => {
  console.log(newTemplate)
  return {
    type: actionTypes.UPDATE_USER_ROOM_TEMPLATES,
    newTemplate,
  }
}


export const loginStart = () => {
  return {
    type: actionTypes.LOGIN_START
  }
}

export const loginSuccess = user => {
  console.log(user)
  return {
    type: actionTypes.LOGIN_SUCCESS,
    user,
  }
}

export const loginFail = errorMessage => {
  console.log(errorMessage);
  return {
    type: actionTypes.LOGIN_FAIL,
    error: errorMessage,
  }
}

export const signup = body => {
  return dispatch => {
    dispatch(loginStart());
    auth.signup(body)
    .then(res => {
      if (res.data.errorMessage) {
        return dispatch(loginFail(res.data.errorMessage))
      }
      dispatch(loginSuccess(res.data))
    })
    .catch(err => {
      dispatch(loginFail('something went wrong'))})
  }
}

export const login = (username, password) => {
  return (dispatch, getState) => {
    dispatch(loginStart());
    auth.login(username, password)
    .then(res => {
      if (res.data.errorMessage) {return dispatch(loginFail(res.data.errorMessage))}
      const courses = normalize(res.data.courses)
      const rooms = normalize(res.data.rooms)
      dispatch(gotCourses(courses));
      dispatch(gotRooms(rooms))
      const user = {
        ...res.data,
        rooms: res.data.rooms.map(r => r._id),
        courses: res.data.courses.map(c => c._id),
      }
      return dispatch(loginSuccess(user));
    })
    .catch(err => {
      console.log(err)
      dispatch(loginFail(err.response.statusText))
    })
  }
}

export const grantAccess = (user, resource, id) => {
  console.log('grNTING access to - ', user, resource, id)
  return dispatch => {
    API.grantAccess(user, resource, id)
    .then(res => {
      console.log(res.data.result)
      if (resource === 'room') {
        console.log(res.data.result)
        return dispatch(updateRoom(res.data.result))
      }
      // dispatch(updateUserCourses(resp.data.result)) @TODO Need to update the notifcations associated with this course
      return dispatch(updateCourse(res.data.result))
    })
  }
}

export const googleLogin = (username, password) => {
  return dispatch => {
    dispatch(loginStart());
    auth.googleLogin(username, password)
    .then(res => {
      dispatch(loginSuccess(res));
    })
    .catch(err => {
      dispatch(loginFail(err));
    })
  }
}

export const clearError = () => {
  return {type: actionTypes.CLEAR_ERROR}
}
