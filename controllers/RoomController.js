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

  addCurrentUsers: (roomId, userId) => {
    console.log('updating current users');
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$addToSet: {currentUsers: userId}}, {new: true})
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, userId) => {
    console.log('removing a user from room controller')
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentUsers: userId}}, {new: true})
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  }
}
