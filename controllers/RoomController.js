const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.Room.find(params)
      .then(rooms => resolve(rooms))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .populate({path: 'events'})
      .populate({path: 'chat', populate: {path: 'user'}})
      .populate({path: 'currentUsers'})
      .then(room => {
        console.log(room)
        resolve(room)})
      .catch(err => reject(err))
    });
  },

  post: body => {
    return new Promise((resolve, reject) => {
      console.log(body)
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
  },

  updateCurrentUsers: (roomId, userId) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$addToSet: {currentUsers: userId}}, {new: true})
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  }
}
