import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import { normalize } from '../utils/normalize';
import API from '../../utils/apiRequests';
import * as loading from './loading'
import { updateCourse, gotCourses } from './courses';
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

export const clearNotification = (ntfId, userId, resource, listType) => {
  return (dispatch) => {
    API.removeNotification(ntfId, userId, resource, listType)
    .then(res => {
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
      dispatch(gotUser(user))
      return dispatch(loading.success());
    })
    .catch(err => {
      dispatch(loading.fail(err.response.statusText))
    })
  }
}

// ENTRY CODE IS OPTIONAL
// WE SHOULD JUST SEPARATE OUT CHECKROOMACCESS into the ROOM ACTIONS FILE
export const requestAccess = (toUser, fromUser, resource, resourceId, entryCode) => {
  console.log(toUser)
  console.log(fromUser)
  console.log(resource)
  console.log(entryCode)
  return dispatch => {
    dispatch(loading.start());
    if (resource === 'room' && entryCode) {
      console.log('checking room access')
      API.checkRoomAccess(resourceId, fromUser.id, entryCode)
      .then(res => {
        dispatch(addUserRooms([resourceId]))
        dispatch(addRoomMember(resourceId, {
          role: 'students', user: {_id: fromUser.id, username: fromUser.username}
        }))
        return dispatch(loading.success())
      })
      .catch(err => loading.fail(err))
    } else {
      console.log("REQUESTING ACCESS")
      API.requestAccess(toUser, fromUser, resource, resourceId)
      .then(res => {
        return dispatch(loading.accessSuccess())
      })
      .catch(err => {
        return dispatch(loading.fail())})
      }
    }
}

export const grantAccess = (user, resource, resourceId) => {
  return dispatch => {
    console.log(user, resource, resourceId)
    dispatch(loading.start())
    API.grantAccess(user, resource, resourceId)
    .then(res => {
      if (resource === 'room') {
        return dispatch(updateRoom(resourceId, {members: res.data.result.members}))
      }
      console.log(res.data.result)
      dispatch(updateUserAccessNtfs(resource, user))
      dispatch(loading.success())
      // dispatch(updateCourse(res.data.result))
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
