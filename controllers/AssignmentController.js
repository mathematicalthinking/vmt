const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Assignment.find(params)
      .then(assignments => resolve(assignments))
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise({resolve, reject} => {
      db.Assignment.findById(id)
      .then(assignment => resolve(assignment))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.Assignment.create(body)
      .then(assignment => resolve(assignment))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Assignment.findByIdAndUpdate(id, body)
      .then(assignment => resolve(assignment))
      .catch(err => reject(err))
    })
  }
}
