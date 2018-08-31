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
      .populate({path: 'creator', select: 'username'})
      .populate({path: 'chat.user', select: 'username'})
      .populate({path: 'currentUsers', select: 'username'})
      .populate({path: 'members.user', select: 'username'})
      .populate({path: 'notifications.user', select: 'username'})
      .populate({path: 'course', select: 'name'})
      .then(room => {
        resolve(room)})
      .catch(err => reject(err))
    });
  },
// @TODO I SEEM TO BE USING MODEL METHODS SOMETIMES AND THEN OTHER TIMES (LIKE HERE)
// JUST DOING ALL OF THE WORK IN THE CONTROLLER...PROBABLY NEED TO BE CONSISTENT
  post: body => {
    return new Promise((resolve, reject) => {
        db.Room.create(body)
        .then(room => {
          if (body.course) {
            room.populate({path: 'course', select: 'name'})
          }
          room.populate({path: 'members.user', select: 'username'}, () => {
            resolve(room)
          })
        })
        .catch(err => {console.log(err); reject(err)})
      // }
    })
  },

  put: (id, body) => {
    const updatedField = Object.keys(body)
    if (updatedField[0] === 'members') {
      body = {$addToSet: body, $pull: {notifications: {user: body.members.user}}}
      db.User.findByIdAndUpdate(body.members.user, {$addToSet: {rooms: id}})
    }
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(id, body, {new: true})
      .populate('creator')
      .populate('members.user')
      .populate('notifications.user')
      .then(room => { console.log(room); resolve(room)})
      .catch(err => {console.log(err); reject(err)})
    })
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .then(room => {
        room.remove()
        resolve(room)
      })
      .catch(err => reject(err))
    })
  },

  addCurrentUsers: (roomId, userId) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$addToSet: {currentUsers: userId}}, {new: true})
      .populate('currentUsers')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, userId) => {
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentUsers: userId}}, {new: true})
      .populate('currentUsers')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },


}
