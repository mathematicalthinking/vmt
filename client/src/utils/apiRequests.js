import axios from 'axios';
import Promise from 'bluebird';

// we could make this more modular like the api handler on the backend
// instead of having resource specific functions we could pass the resource
// to the function along with other params, ids, etc.
export default {
  getMessages: params => {
    return new Promise((resolve, reject) => {
      axios.get('/api/message')
      .then(response => {
        resolve(response.data.results)
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  postMessage: message => {
    return new Promise((resolve, reject) => {
      axios.post('/api/message', message)
      .then(response => {
        resolve(response.data.result)
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  getUsers: params => {
    return new Promise((resolve, reject) => {
      axios.get('/api/user')
      .then(response => {
        resolve(response.data.results);
      })
      .catch(err => {
        reject(err);
      });
    });
  },

  postUser: user => {
    return new Promise((resolve, reject) => {
      axios.post('/api/user', user)
      .then(response => resolve(response.data.results))
      .catch(err => reject(err));
    });
  },

  getRooms: params => {
    return new Promise((resolve, reject) => {
      console.log("getting rooms")
      axios.get('/api/room')
      .then(response => resolve(response.data.results))
      .catch(err => reject(err))
    })
  },

  getCourses: params => {
    return new Promise((resolve, reject) => {
      axios.get('/api/course')
      .then(response => {resolve(response.data.results)})
      .catch(err => reject(err))
    })
  }
}
