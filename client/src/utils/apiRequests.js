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
    console.log('Entering with code ')
    console.log(resource, resourceId, userId, entryCode)
    return axios.put(`/api/${resource}/${resourceId}`, {checkAccess: {userId, entryCode,}})
  },

  requestAccess: (owners, userId, resource, resourceId) => {
    // @TODO consider making notificationTypes a directory of constants like action types in redux
    console.log(owners, userId, resource, resourceId,)
    let promises = owners.map(owner => {
      return axios.put(`/api/user/${owner._id}`, {notificationType: 'requestAccess', user: userId, resource, _id: resourceId})
    })
    return Promise.all(promises)
  },

  removeNotification: (ntfId, userId, resource, listType, ntfType) => {
    console.log("REMOVING NOTIFICATION")
    return axios.put(`/api/user/${userId}`, {
      removeNotification: {
        ntfId,
        resource,
        listType,
        ntfType,
      }
    })
  },

  grantAccess: (user, resource, resourceId) => {
    console.log('granting access to ', user, ' for ', resource, resourceId)
    return axios.put(`/api/${resource}/${resourceId}`, {newMember: user})
  },

  updateMembers: (resource, resourceId, updatedMembers) => {
    return axios.put(`/api/${resource}/${resourceId}`, {members: updatedMembers})
  },
  getDesmos: url => {
    return axios.get(`/desmos?url=${url}`)
  }
}
