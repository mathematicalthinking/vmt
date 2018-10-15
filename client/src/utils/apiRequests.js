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

  enterWithCode: (resource, resourceId, userId, entryCode) => {
    return axios.put(`/api/${resource}/${resourceId}`, {checkAccess: {userId, entryCode,}})
  },

  requestAccess: (toUser, fromUser, resource, resourceId) => {
    // @TODO consider making notificationTypes a directory of constants like action types
    return axios.put(`/api/user/${toUser}`, {notificationType: 'requestAccess', user: fromUser, resource, _id: resourceId})
  },

  removeNotification: (ntfId, userId, resource, listType) => {
    console.log(ntfId, userId, listType, resource)
    return axios.put(`/api/user/${userId}`, {
      removeNotification: {
        ntfId,
        resource,
        listType,
      }
    })
  },

  grantAccess: (user, resource, resourceId) => {
    return axios.put(`/api/${resource}/${resourceId}`, {newMember: user})
  },

  updateMembers: (resource, resourceId, updatedMembers) => {
    return axios.put(`/api/${resource}/${resourceId}`, {members: updatedMembers})
  },
  getDesmos: url => {
    return axios.get(`/desmos?url=${url}`)
  }
}
