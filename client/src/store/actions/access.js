import {
  updateCourse,
  updateRoom,
  removeNotification,
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
      if (resource === 'rooms') {
        dispatch(addUserRooms([resourceId]))
        dispatch(addRoomMember(resourceId, {
          role: 'participant', user: {_id: userId, username: username}
        }))
      } else if (resource === 'courses') {
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
  console.log(user, resource, resourceId)
  return (dispatch, getState) => {
    dispatch(loading.start())
    let thisUser = getState().user._id;
    let singResource = resource.slice(0, resource.length - 1) // <-- THIS IS ANNOYING
    API.removeNotification(resourceId, thisUser, user, singResource, 'access', 'requestAccess')
    .then(res => {
      console.log("res1: ", res)
      dispatch(removeNotification(singResource, 'access', user, resourceId))
      // dispatch(gotUser(res.data))
    })
    .catch(err => console.log(err))
    API.grantAccess(user, resource, resourceId)
    .then(res => {
      console.log('res 2')
      if (resource === 'rooms') {
        dispatch(updateRoom(resourceId, {members: res.data})) // change to add 
      } else if (resource === 'courses') {
        dispatch(updateCourse(resourceId, {members: res.data})) // change to add 
      }
      // let { user } = getState()
      // let singResource = resource.slice(0, resource.length - 1) // <-- THIS IS ANNOTING \\ WE COULD JUST REANME THE FIELD courseSnotifications?
      // let updatedNotifications = user[`${singResource}Notifications`]
      // updatedNotifications.access = user[`${singResource}Notifications`].access.filter(ntf => {
      //   return ntf._id !== resourceId
      // })
      dispatch(loading.success())
    })
    .catch(err => {console.log(err); dispatch(loading.fail(err))})
  }
}