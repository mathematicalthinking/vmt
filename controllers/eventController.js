const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.Event.find(params).populate('user')
      .then(events => resolve(events))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Event.findById(id)
      .then(event => resolve(event))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    console.log(body)
    return new Promise((resolve, reject) => {
      db.Event.create(body)
      .then(event => resolve(event))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Event.findByIdAndUpdate(id, body)
      .then(event => resolve(event))
      .catch(err => reject(err))
    })
  }
}
