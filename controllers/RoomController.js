const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.Room.find(params).sort('-createdAt')
      .then(rooms => resolve(rooms))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .populate({path: 'creator'})
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
      if (body.template) {
        const {name, description, templateIsPublic, creator} = body;
        const template = {name, description, isPublic: templateIsPublic, creator,}
        db.RoomTemplate.create(template)
        .then(template => {
          body.template = template._id,
          delete body[templateIsPublic]
          db.Room.create(body)
          .then(room => resolve(room))
          .catch(err => reject(err))
        })
        .catch(err => reject(err))
      } else {
        db.Room.create(body)
        .then(room => resolve(room))
        .catch(err => reject(err))
      }
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
      .populate('currentUsers')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, userId) => {
    console.log('removing a user from room controller')
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentUsers: userId}}, {new: true})
      .populate('currentUsers')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  }
}
