import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import { normalize } from '../utils/normalize';
import API from '../../utils/apiRequests';
import * as loading from './loading'
import { gotCourses, } from './courses';
import { addRoomMember } from './rooms';


export const gotUser = (user, temp) => {
  let loggedIn = true;
  if (temp) loggedIn = false
  return {
    type: actionTypes.GOT_USER,
    user,
    loggedIn,
  }
}

export const updateUser = (body) => {
  return {
    type: actionTypes.UPDATE_USER,
    body,
  }
}

export const removeUserCourse = courseId => {
  return {
    type: actionTypes.REMOVE_USER_COURSE,
    courseId,
  }
}

export const addUserCourses = newCoursesArr => {
  return {
    type: actionTypes.ADD_USER_COURSES,
    newCoursesArr,
  }
}

export const addUserActivities = newActivitiesArr => {
  return {
    type: actionTypes.ADD_USER_ACTIVITIES,
    newActivitiesArr,
  }
}

export const removeUserActivities = activityIdsArr => {
  return {
    type: actionTypes.REMOVE_USER_ACTIVITIES,
    activityIdsArr,
  }
}

export const addUserRooms = newRoomsArr => {
  return {
    type: actionTypes.ADD_USER_ROOMS,
    newRoomsArr,
  }
}

export const removeUserRooms = roomIdsArr => {
  return {
    type: actionTypes.REMOVE_USER_ROOMS,
    roomIdsArr,
  }
}

export const logout = () => {
  return{type: actionTypes.LOGOUT}
}

export const addUserCourseTemplates = newTemplate => {
  return {
    type: actionTypes.ADD_USER_COURSE_TEMPLATES,
    newTemplate,
  }
}

export const updateNotifications = (updatedNotifications) => {
  return {
    type: actionTypes.UPDATE_NOTIFICATIONS,
    updatedNotifications,
  }
}

export const removeNotification = (resource, listType, user, ntfId) => {
  return {
    type: actionTypes.REMOVE_NOTIFICATION,
    resource,
    listType,
    user,
    ntfId,
  }
}

export const updateUserResource = (resource, resourceId, userId) => {
  return (dispatch) => {
    API.addUserResource(resource, resourceId, userId)
    .then(res => {
      dispatch(addUserActivities([resourceId]))
    })
    .catch(err => dispatch(loading.fail(err)))
  }
}

// For clearing notifications after the user has seen it. As opposed to request for access notifications which are cleared
// when the user explicitly grants access (see actions.access)
export const clearNotification = (ntfId, userId, requestingUser, resource, listType, ntfType) => {
  return (dispatch) => {
    let singResource = resource.slice(0, resource.length - 1) // <-- THIS IS ANNOYING
    API.removeNotification(ntfId, userId, requestingUser, singResource, listType, ntfType)
    .then(res => {
      dispatch(removeNotification(singResource, listType, requestingUser, ntfId))
      // dispatch(gotUser(res.data))
    })
    .catch(err => console.log(err))
  }
}

export const signup = (body, room) => { // room is optional -- if we're siging up a 
  return dispatch => {
    if (room) {
      dispatch(addRoomMember(room, {user:{username: body.username, _id: body._id}, role: 'facilitator'}))
    }
    dispatch(loading.start());
    auth.signup(body)
    .then(res => {
      if (res.data.errorMessage) return dispatch(loading.fail(res.data.errorMessage))
      dispatch(gotUser(res.data));
      dispatch(loading.success());
    })
    .catch(err => {
      dispatch(loading.fail('something went wrong'))})
  }
}

export const login = (username, password) => {
  return (dispatch, getState) => {
    dispatch(loading.start());
    auth.login(username, password)
    .then(res => {
      if (res.data.errorMessage) {return dispatch(loading.fail(res.data.errorMessage))}
      let courses = normalize(res.data.courses)
      // const activities = normalize(res.data.activities)
      dispatch(gotCourses(courses));
      let user = {
        ...res.data,
        courses: courses.allIds,
      }
      dispatch(gotUser(user))
      return dispatch(loading.success());
    })
    .catch(err => {
      console.log(err)
      dispatch(loading.fail(err.response.statusText))
    })
  }
}

export const getUser = (id) => {
  console.log('getting user info')
  return (dispatch) => {
    dispatch(loading.start())
    API.getById('user', id)
    .then(res => {
      // console.log(res)
      console.log(res.data.result)
      let courses = normalize(res.data.result.courses)
      let user = {
        ...res.data.result,
        courses: courses.allIds,
      }
      console.log("USER: ", user)
      dispatch(gotUser(user))
      dispatch(loading.success())
    })
    .catch(err => {
      console.log(err)
      dispatch(loading.fail(err))
    })
  
  }
}

export const googleLogin = (username, password) => {
  return dispatch => {
    dispatch(loading.start());
    auth.googleLogin(username, password)
    .then(res => {
      dispatch(loading.success(res));
    })
    .catch(err => {
      dispatch(loading.fail(err));
    })
  }
}

export const clearError = () => {
  return {type: actionTypes.CLEAR_ERROR}
}
