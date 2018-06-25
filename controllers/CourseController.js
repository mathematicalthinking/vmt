const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Course.find(params)
      .then(courses => resolve(courses))
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .then(course => resolve(course))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.Course.create(body)
      .then(course => resolve(course))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Course.findByIdAndUpdate(id, body)
      .then(course => resolve(course))
      .catch(err => reject(err))
    })
  }
}
