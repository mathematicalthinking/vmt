const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Room.find(params)
      .then(rooms => resolve(rooms))
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .then(room => resolve(room))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.Room.create(body)
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(id, body)
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  }
}
