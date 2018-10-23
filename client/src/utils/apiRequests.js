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

  requestAccess: (owners, userId, resource, resourceId) => {
    // @TODO consider making notificationTypes a directory of constants like action types in redux
    let promises = owners.map(owner => {
      return axios.put(`/api/user/${owner._id}`, {notificationType: 'requestAccess', user: userId, resource, _id: resourceId})
    })
    return Promise.all(promises)
  },

  removeNotification: (ntfId, userId, resource, listType, ntfType) => {
    return axios.put(`/api/user/${userId}`, {
      removeNotification: {
        ntfId,
        resource,
        listType,
        ntfType,
      }
    })
  },

  removeUserFrom: (resource, resourceId, user) => {
    return axios.delete(`api/${resource}/${resourceId}/remove`, {members: {user,}})
  },

  grantAccess: (user, resource, resourceId) => {
    return axios.post(`/api/${resource}/${resourceId}/add`, {members: {user, role: 'participant'}})
  },

  updateMembers: (resource, resourceId, updatedMembers) => {
    console.log("U{PDATED <EBERS: ", updatedMembers)
    return axios.put(`/api/${resource}/${resourceId}`, {members: updatedMembers})
  },
  getDesmos: url => {
    return axios.get(`/desmos?url=${url}`)
  }
}
