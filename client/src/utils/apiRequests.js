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

  requestAccess: (resource, resourceId, userId) => {
    // @TODO consider making notificationTypes a directory of constants like action types
    const notification = {notifications: {user: userId, notificationType: 'requestAccess'}}
    return axios.put(`/api/${resource}/${resourceId}`, notification)
  },

  grantAccess: (user, resource, id) => {
    const newMember = {newMember: {user, role: 'Student'}}
    return axios.put(`/api/${resource}/${id}`, newMember)
  },
  getDesmos: () => {
    console.log('geting desoms')
    return axios.get(`/desmos`)
  }
}
