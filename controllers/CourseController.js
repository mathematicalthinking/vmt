const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.Course.find(params).sort('-createdAt')
      .then(courses => resolve(courses))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .populate('creator')
      .populate('rooms')
      // .populate('members.user')
      .populate('notifications.user')
      .then(course => resolve(course))
      .catch(err => reject(err))
    });
  },

  post: body => {
    return new Promise((resolve, reject) => {
      db.Course.create(body)
      .then(course => resolve(course))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    const updatedField = Object.keys(body)
    if (updatedField[0] === 'notifications'){
      body = {$addToSet: body}
      console.log(body)
    }
    return new Promise((resolve, reject) => {
      db.Course.findByIdAndUpdate(id, body, {new: true})
      .then(course => resolve(course))
      .catch(err => reject(err))
    })
  }
}
