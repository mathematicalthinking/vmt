import axios from 'axios';

export default {
  get: (resource, params) => {
    return axios.get(`/api/${resource}`, params)
  },

  post: (resource, body) => {
    return axios.post(`/api/${resource}`, body)
  },
}
  // put: (resource, )
