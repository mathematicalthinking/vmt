import {
  updateCourse,
  updateRoom,
  updateNotifications,
  addUserRooms,
  addRoomMember,
} from './index'
import * as loading from './loading'
import API from '../../utils/apiRequests';

export const joinWithCode = (resource, resourceId, userId, username, entryCode, ) => {
  return dispatch => {
    console.log(resourceId, userId, entryCode, username)
    API.enterWithCode(resource, resourceId, userId, entryCode)
    .then(res => {
      if (resource === 'room') {
        dispatch(addUserRooms([resourceId]))
        dispatch(addRoomMember(resourceId, {
          role: 'student', user: {_id: userId, username: username}
        }))
      } else if (resource === 'course') {

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
      console.log("RES IN ACTIONS: ", res)
      return dispatch(loading.accessSuccess())
    })
    .catch(err => {
      return dispatch(loading.fail())
    })
  }
}

export const grantAccess = (user, resource, resourceId) => {
  return (dispatch, getState) => {
    console.log('resource in access acitons: ', resource)
    dispatch(loading.start())
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
      console.log('updating notifications')
      dispatch(updateNotifications(resource, updatedNotifications))
      dispatch(loading.success())
    })
    .catch(err => {console.log(err); dispatch(loading.fail(err))})
  }
}