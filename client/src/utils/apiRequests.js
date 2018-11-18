import axios from 'axios';

export default {
  get: (resource, params) => {
    return axios.get(`/api/${resource}`, params)
  },

  post: (resource, body) => {
    return axios.post(`/api/${resource}`, body)
  },

  put: (resource, id, body) => {
    return axios.put(`/api/${resource}/${id}`, body)
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

  requestAccess: (owners, userId, resource, resourceId) => {
    // @TODO consider making notificationTypes a directory of constants like action types in redux
    let promises = owners.map(owner => {
      return axios.put(`/api/user/${owner._id}`, {notificationType: 'requestAccess', user: userId, resource, _id: resourceId})
    })
    return Promise.all(promises)
  },

  removeNotification: (ntfId, userId, requestingUser, resource, listType, ntfType) => {
    return axios.put(`/api/user/${userId}/remove`, {
      [`${resource}Notifications.${listType}`]: {
        notificationType: ntfType,
        _id: ntfId,
        user: requestingUser,
      }
    })
  },

  removeMember: (resource, resourceId, user) => {
    return axios.put(`/api/${resource}/${resourceId}/remove`, {members: {user,} })
  },

  addUserResource: (resource, resourceId, userId) => {
    return axios.put(`/api/user/${userId}/add`, {[resource]: resourceId})
  },

  grantAccess: (user, resource, resourceId) => {
    console.log('granting access: ', user, resource, resourceId)
    return axios.put(`/api/${resource}/${resourceId}/add`, {members: {user, role: 'participant'}})
  },

  updateMembers: (resource, resourceId, updatedMembers) => {
    return axios.put(`/api/${resource}/${resourceId}`, {members: updatedMembers})
  },
  getDesmos: url => {
    return axios.get(`/desmos?url=${url}`)
  }
}
