import axios from 'axios';
export default {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      console.log("Making auth request from front end");
      axios.post('/auth/login', {username, password,})
      .then(response => {
        resolve(response.data.result)
      })
      .catch(err => {
        reject(err)
      })
    })
  },
}
