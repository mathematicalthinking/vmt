const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.User.find(params)
      .then(users => resolve(users))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    console.log('Getting user ', id, ' info')
    return new Promise((resolve, reject) => {
      db.User.findById(id)
      // .populate({
      //   path: 'rooms',
      //   options: {sort: {createdAt: -1}}
      // })
      .populate('courses')
      .populate('courseTemplates')
      .then(user => resolve(user))
      .catch(err => reject(err))
    });
  },

  post: body => {
    return new Promise((resolve, reject) => {
      db.User.create(body)
      .then(user => resolve(user))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.User.findByIdAndUpdate(id, body)
      .then(user => resolve(user))
      .catch(err => reject(err))
    })
  }
}
