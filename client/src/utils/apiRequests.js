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
    const notification = {notifications: {user: userId, notificationType: 'requestAcess'}}
    return axios.put(`/api/${resource}/${resourceId}`, notification)
  }
}
