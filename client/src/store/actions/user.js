import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import API from '../../utils/apiRequests';

import { gotCurrentCourse, gotCourses } from './courses';
import { gotCurrentRoom } from './rooms';

export const updateUserRooms = newRoom => {
  return {
    type: actionTypes.UPDATE_USER_ROOMS,
    newRoom,
  }
}

export const updateUserCourses = newCourse => {
  return {
    type:actionTypes.UPDATE_USER_COURSES,
    newCourse,
  }
}

export const updateUserCourseTemplates = newTemplate => {
  console.log(newTemplate)
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
  return dispatch => {
    dispatch(loginStart());
    auth.login(username, password)
    .then(res => {
      if (res.data.errorMessage) {
        return dispatch(loginFail(res.data.errorMessage))
      }
      // prepare the data for the store
      const { username, _id, courses } = res.data
      console.log(res.data)
      const userCourses = courses.map(crs => crs._id)
      console.log(userCourses)
      const masterCourses = courses.reduce((acc, cur) => {
        acc[cur._id] = {name: cur.name, description: cur.description}
        return acc;
      }, {});
      console.log(masterCourses)
      dispatch(loginSuccess({username, _id, courses: userCourses}))
      dispatch(gotCourses(masterCourses))
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
      if (resource === 'room') {
        console.log(res.data.result)
        return dispatch(gotCurrentRoom(res.data.result))
      }
      // dispatch(updateUserCourses(resp.data.result)) @TODO Need to update the notifcations associated with this course
      return dispatch(gotCurrentCourse(res.data.result))
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
