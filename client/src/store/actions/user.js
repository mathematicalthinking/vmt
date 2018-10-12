import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import { normalize } from '../utils/normalize';
import API from '../../utils/apiRequests';
import * as loading from './loading'
import { gotCourses, updateCourse, } from './courses';
import { updateRoom, addRoomMember } from './rooms';


export const gotUser = user => {
  return {
    type: actionTypes.GOT_USER,
    user,
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

export const updateUserAccessNtfs = (resource, user) => {
  if (resource === 'course') {
    return {
      type: actionTypes.UPDATE_USER_COURSE_ACCESS_NTFS,
      user,
    }
  }
}

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

export const clearNotification = (ntfId, userId, resource, listType) => {
  return (dispatch) => {
    API.removeNotification(ntfId, userId, resource, listType)
    .then(res => {
      console.log("NTF REMOVED: ", res)
      if (resource === 'course') {
        dispatch(updateNotifications(resource, res.data.result[`${resource}Notifications`]))
      }
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
      console.log(res.data)
      if (res.data.errorMessage) {return dispatch(loading.fail(res.data.errorMessage))}
      const courses = normalize(res.data.courses)
      // const activities = normalize(res.data.activities)
      dispatch(gotCourses(courses));
      const user = {
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

// ENTRY CODE IS OPTIONAL
// WE SHOULD JUST SEPARATE OUT CHECKROOMACCESS into the ROOM ACTIONS FILE
export const requestAccess = (toUser, fromUser, resource, resourceId, entryCode) => {
  return dispatch => {
    dispatch(loading.start());
    API.requestAccess(toUser, fromUser, resource, resourceId)
    .then(res => {
      return dispatch(loading.accessSuccess())
    })
    .catch(err => {
      return dispatch(loading.fail())})
    }
}

export const grantAccess = (user, resource, resourceId) => {
  return (dispatch, getState) => {
    let apiResource = resource.slice(0, -1);
    if (apiResource === 'activitie') apiResource = 'activity';
    dispatch(loading.start())
    API.grantAccess(user, apiResource, resourceId)
    .then(res => {
      if (apiResource === 'room') {
        return dispatch(updateRoom(resourceId, {members: res.data.result.members}))
      } else if (apiResource === 'course') {
        dispatch(updateCourse(resourceId, {members: res.data.result.members}))
      }
      const { user } = getState()
      const updatedNotifications = user[`${apiResource}Notifications`]
      updatedNotifications.access = user[`${apiResource}Notifications`].access.filter(ntf => {
        return ntf._id !== resourceId
      })
      dispatch(updateNotifications(apiResource, updatedNotifications))
      dispatch(loading.success())
    })
    .catch(err => {console.log(err); dispatch(loading.fail(err))})
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
