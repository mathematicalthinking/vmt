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

export const requestAccess = (toUser, fromUser, resource, resourceId,) => {
  return dispatch => {
    dispatch(loading.start());
    API.requestAccess(toUser, fromUser, resource, resourceId)
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