import axios from 'axios';

export default {
  get: (resource, params) => {
    return axios.get(`/api/${resource}`, params)
  },

  post: (resource, body) => {
    return axios.post(`/api/${resource}`, body)
  },

  getById: (resource, id) => {
    return axios.get(`/api/${resource}/${id}`)
  },

  remove: (resource, id) => {
    return axios.delete(`/api/${resource}/${id}`)
  },

  // CONSIDER MOVING ALL OF THE ACCESS CHECKING / GRANTING TO THE AUTH util
  checkRoomAccess: (roomId, userId, entryCode) => {
    console.log(roomId, userId, entryCode)
    return axios.put(`/api/room/${roomId}`, {checkAccess: {userId, entryCode,}})
  },

  requestAccess: (toUser, fromUser, resource, resourceId) => {
    console.log(toUser)
    // @TODO consider making notificationTypes a directory of constants like action types
    return axios.put(`/api/user/${toUser}`, {notificationType: 'requestAccess', user: fromUser, resource, _id: resourceId})
  },

  removeNotification: (ntfId, userId, resource, listType) => {
    console.log({$pull: {[`${resource}Notifications.${listType}`]: {_id: ntfId}}})
    return axios.put(`/api/user/${userId}`, {
      $pull: {[`${resource}Notifications.${listType}`]: {_id: ntfId}}
    })
  },

  grantAccess: (user, resource, resourceId) => {
    return axios.put(`/api/${resource}/${resourceId}`, {newMember: user})
  },
  getDesmos: url => {
    console.log('geting desoms')
    console.log(url)
    return axios.get(`/desmos?url=${url}`)
  }
}
