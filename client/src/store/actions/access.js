import {
  updateCourse,
  updateRoom,
  updateNotifications,
  addUserRooms,
  addRoomMember,
  addUserCourses,
  addCourseMember,
} from './index'
import * as loading from './loading'
import API from '../../utils/apiRequests';

export const joinWithCode = (resource, resourceId, userId, username, entryCode, ) => {
  return dispatch => {
    API.enterWithCode(resource, resourceId, userId, entryCode)
    .then(res => {
      if (resource === 'room') {
        dispatch(addUserRooms([resourceId]))
        dispatch(addRoomMember(resourceId, {
          role: 'participant', user: {_id: userId, username: username}
        }))
      } else if (resource === 'course') {
        dispatch(addUserCourses([resourceId]))
        dispatch(addCourseMember(resourceId, {
          role: 'participant', user: {_id: userId, username: username}
        }))
      }
      return dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail('That entry code was incorrect. Try again.')))
  } 
}

export const requestAccess = (owners, userId, resource, resourceId) => {
  return dispatch => {
    dispatch(loading.start());
    API.requestAccess(owners, userId, resource, resourceId)
    .then(res => {
      return dispatch(loading.accessSuccess())
    })
    .catch(err => {
      return dispatch(loading.fail())
    })
  }
}

export const grantAccess = (user, resource, resourceId) => {
  return (dispatch, getState) => {
    dispatch(loading.start())
    let thisUser = getState().user._id;
    API.removeNotification(resourceId, thisUser, resource, 'access')
    .then(res => {
      dispatch(updateNotifications(resource, res.data.result[`${resource}Notifications`]))
      // dispatch(gotUser(res.data))
    })
    .catch(err => console.log(err))
    API.grantAccess(user, resource, resourceId)
    .then(res => {
      if (resource === 'room') {
        dispatch(updateRoom(resourceId, {members: res.data.result.members}))
      } else if (resource === 'course') {
        dispatch(updateCourse(resourceId, {members: res.data.result.members}))
      }
      const { user } = getState()
      const updatedNotifications = user[`${resource}Notifications`]
      updatedNotifications.access = user[`${resource}Notifications`].access.filter(ntf => {
        return ntf._id !== resourceId
      })
      dispatch(loading.success())
    })
    .catch(err => {console.log(err); dispatch(loading.fail(err))})
  }
}