const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Notification.find(params)
      .then(notifications => resolve(notifications))
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Notification.findById(id)
      .then(notification => resolve(notification))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.Notification.create(body)
      .then(notification => resolve(notification))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Notification.findByIdAndUpdate(id, body)
      .then(notification => resolve(notification))
      .catch(err => reject(err))
    })
  }
}