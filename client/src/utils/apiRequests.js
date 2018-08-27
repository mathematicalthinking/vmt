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

  requestAccess: (toUser, fromUser, resource, resourceId) => {
    console.log(toUser)
    // @TODO consider making notificationTypes a directory of constants like action types
    return axios.put(`/api/user/${toUser}`, {notificationType: 'requestAccess', user: fromUser, resource, _id: resourceId})

  },

  grantAccess: (user, resource, resourceId) => {
    return axios.put(`/api/${resource}/${resourceId}`, {newMember: user})
  },
  getDesmos: () => {
    console.log('geting desoms')
    return axios.get(`/desmos`)
  }
}
