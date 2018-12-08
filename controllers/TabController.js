const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Tab.find(params)
      .then(tabs => resolve(tabs))
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Tab.findById(id)
      .then(tab => resolve(tab))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      let newTab;
      db.Tab.create(body)
      .then(tab => {
        newTab = tab;
        return db.Room.findByIdAndUpdate(body.room, {$addToSet: {tabs: tab._id}})
      })
      .then(room => {
        resolve(newTab)
      })
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Tab.findByIdAndUpdate(id, body)
      .then(tab => resolve(tab))
      .catch(err => reject(err))
    })
  }
}
