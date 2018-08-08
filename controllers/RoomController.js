const db = require('../models')

module.exports = {
  get: params => {
    if (params.constructor === Array) {
      params = {'_id': {$in: params}}
    }
    return new Promise((resolve, reject) => {
      db.Room.find(params).sort('-createdAt')
      .then(rooms => resolve(rooms))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .populate('creator')
      .populate('events')
      .populate('chat.user')
      .populate('currentUsers')
      .populate('members.user')
      .populate('notifications.user')
      .then(room => {
        resolve(room)})
      .catch(err => reject(err))
    });
  },

  post: body => {
    return new Promise((resolve, reject) => {
      if (body.template) {
        const {name, description, templateIsPublic, creator, tabs} = body;
        console.log(templateIsPublic)
        const template = {name, description, isPublic: templateIsPublic, creator, tabs,}
        db.RoomTemplate.create(template)
        .then(template => {
          body.template = template._id,
          delete body[templateIsPublic]
          db.Room.create(body)
          .then(room => resolve([room, template]))
          .catch(err => reject(err))
        })
        .catch(err => reject(err))
      } else {
        delete body.template;
        delete body.templateIsPublic;
        db.Room.create(body)
        .then(room => resolve(room))
        .catch(err => reject(err))
      }
    })
  },

  put: (id, body) => {
    const updatedField = Object.keys(body)
    if (updatedField[0] === 'notifications') {
      body = {$addToSet: body}
    }
    if (updatedField[0] === 'members') {
      console.log('updating members')
      body = {$addToSet: body, $pull: {notifications: {user: body.members.user}}}
    }
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(id, body, {new: true})
      .populate('creator')
      .populate('members.user')
      .populate('notifications.user')
      .then(room => { console.log(room); resolve(room)})
      .catch(err => reject(err))
    })
  },

  addCurrentUsers: (roomId, userId) => {
    console.log(roomId)
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
