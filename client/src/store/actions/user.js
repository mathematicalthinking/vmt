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
  console.log(newCourse)
  return {
    type: actionTypes.UPDATE_USER_COURSES,
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
  return (dispatch, getState) => {
    dispatch(loginStart());
    auth.login(username, password)
    .then(res => {
      if (res.data.errorMessage) {return dispatch(loginFail(res.data.errorMessage))}
      // If we havent previously grabbed courses from the backend we should populate the courses list in the store
      const user = {...res.data}
      const coursesArr = res.data.courses.map(crs => crs._id);
      user.courses = coursesArr;
      if (getState().courses.allIds.length === 0) {
        const byId = res.data.courses.reduce((acc, cur) => {
          acc[cur._id] = cur;
          return acc;
        }, {});
        console.log(byId, user.courses)
        dispatch(gotCourses(byId, coursesArr)); // @TODO Do we want to do this if we already have all of the public courses
      }
      return dispatch(loginSuccess(user));
    })
    .catch(err => {
      console.log(err)
      dispatch(loginFail(err.response.statusText))
    })
  }
}

// export const grantAccess = (user, resource, id) => {
//   console.log('grNTING access to - ', user, resource, id)
//   return dispatch => {
//     API.grantAccess(user, resource, id)
//     .then(res => {
//       if (resource === 'room') {
//         console.log(res.data.result)
//         return dispatch(gotCurrentRoom(res.data.result))
//       }
//       // dispatch(updateUserCourses(resp.data.result)) @TODO Need to update the notifcations associated with this course
//       return dispatch(gotCurrentCourse(res.data.result))
//     })
//   }
// }

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

// export const getUserCourses = userId => {
//   return dispatch => {
//     API.getById()
//   }
// }

export const clearError = () => {
  return {type: actionTypes.CLEAR_ERROR}
}
