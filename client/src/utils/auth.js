import axios from 'axios';
//@TODO get rid of these cutsome promises -- axios is already retruning a promise
// so return axios.get.... will work fine
export default {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      axios.post('/auth/login', {username, password,})
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  googleLogin: (username, password) => {
    return new Promise((resolve, reject) => {
      axios.get('/auth/googleAuth', {username, password,})
      .then(response => {
        resolve(response.data)
      })
      .catch(err => {
        reject(err);
      })
    })
  }
}
