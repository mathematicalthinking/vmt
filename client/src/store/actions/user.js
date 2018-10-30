import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import { normalize } from '../utils/normalize';
import API from '../../utils/apiRequests';
import * as loading from './loading'
import { gotCourses, } from './courses';


export const gotUser = (user, temp) => {
  return {
    type: actionTypes.GOT_USER,
    user,
    temp,
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
  console.log("DISPATCH ADD_USER_ACIVITIES")
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

// export const updateUserAccessNtfs = (resource, user) => {
//   if (resource === 'courses') {
//     return {
//       type: actionTypes.UPDATE_USER_COURSE_ACCESS_NTFS,
//       user,
//     }
//   }
// }

export const addUserCourseTemplates = newTemplate => {
  return {
    type: actionTypes.ADD_USER_COURSE_TEMPLATES,
    newTemplate,
  }
}

export const updateNotifications = (resource, updatedNotifications) => {
  return {
    type: actionTypes.UPDATE_NOTIFICATIONS,
    updatedNotifications,
    resource,
  }
}

export const updateUserResource = (resource, resourceId, userId) => {
  console.log('why we no make it here')
  return (dispatch) => {
    API.addUserResource(resource, resourceId, userId)
    .then(res => {
      console.log('success')
      dispatch(addUserActivities([resourceId]))
    })
    .catch(err => dispatch(loading.fail(err)))
  }
}

export const clearNotification = (ntfId, userId, resource, listType, ntfType) => {
  return (dispatch) => {
    API.removeNotification(ntfId, userId, resource, listType, ntfType)
    .then(res => {
      let singResource = resource.slice(0, resource.length - 1)
      dispatch(updateNotifications(singResource, res.data.result[`${singResource}Notifications`]))
      // dispatch(gotUser(res.data))
    })
    .catch(err => console.log(err))
  }
}

export const signup = body => {
  return dispatch => {
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
      const courses = normalize(res.data.courses)
      // const activities = normalize(res.data.activities)
      dispatch(gotCourses(courses));
      const user = {
        ...res.data,
        courses: courses.allIds,
      }
      console.log(user)
      dispatch(gotUser(user))
      return dispatch(loading.success());
    })
    .catch(err => {
      console.log(err)
      dispatch(loading.fail(err.response.statusText))
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
