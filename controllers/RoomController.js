const db = require('../models')

module.exports = {
  get: params => {
    if (params.constructor === Array) {
      params = {'_id': {$in: params}}
    }
    return new Promise((resolve, reject) => {
      db.Room
      .find(params)
      .sort('-createdAt')
      .populate({path: 'members.user', select: 'username'})
      .then(rooms => {
        rooms = rooms.map(room => room.summary())
        resolve(rooms)})
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .populate({path: 'creator', select: 'username'})
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .populate({path: 'members.user', select: 'username'})
      .populate({path: 'notifications.user', select: 'username'})
      .populate({path: 'course', select: 'name'})
      .populate({path: 'tabs.events', select: '-room'})
      .then(room => {
        console.log("ROOM: ", room)
        resolve(room)
      })
      .catch(err => reject(err))
    });
  },
// @TODO I SEEM TO BE USING MODEL METHODS SOMETIMES AND THEN OTHER TIMES (LIKE HERE)
// JUST DOING ALL OF THE WORK IN THE CONTROLLER...PROBABLY NEED TO BE CONSISTENT
  post: body => {
    return new Promise((resolve, reject) => {
        db.Room.create(body)
        .then(room => {
          console.log('successful room creation: ', room  )
          if (body.course) {
            room.populate({path: 'course', select: 'name'})
          }
          room.populate({path: 'members.user', select: 'username'}, () => {
            resolve(room)
          })
        })
        .catch(err => {
          console.log(err); reject(err)})
      // }
    })
  },

// @TODO WE SHOULD PROBABLY JUST CREATE DIFFERENT METHODS FOR EACH OF THESE CASES?
  put: (id, body) => {
    console.log("IN TYHE CONTROLLER: ", id, body)
    return new Promise((resolve, reject) => {
      const updatedField = Object.keys(body)
      console.log(updatedField)
      const { entryCode, userId } = body.checkAccess;
      if (updatedField[0] === 'checkAccess') {
        db.Room.findById(id)
        .then(room => {
          // @TODO SHOULD PROBABLY HASH THIS
          if (room.entryCode === entryCode) {
            room.members.push({user: userId, role: 'student'})
            room.save()
            room.populate({path: 'members.user', select: 'username'}, function() {
              console.log("ROOM: ", room)
              resolve(room)
            })
          } else reject('incorrect entry code')
        })
        .catch(err => reject(err))
      } else {
        console.log('updating room: ', id, body)
        db.Room.findByIdAndUpdate(id, body, {new: true})
        // @TODO TOO MANY POPULATES
        .populate({path: 'creator', select: 'username'})
        .populate({path: 'chat', populate: {path: 'user', select: 'username'}})
        .populate({path: 'members.user', select: 'username'})
        .populate({path: 'notifications.user', select: 'username'})
        .populate({path: 'course', select: 'name'})
        .populate({path: 'tabs.events', select: '-room'})
        .populate({path: 'chat', select: '-room'})
        .then(room => { console.log(room); resolve(room)})
        .catch(err => {console.log(err); reject(err)})
      }
    })
  },

  // addMember
  // remove member

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

  // SOCKET METHODS
  addCurrentUsers: (roomId, userId) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$addToSet: {currentUsers: userId}}, {new: true})
      .populate({path: 'currentUsers', select: 'username'})
      .select('currentUsers events chat')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, userId) => {
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentUsers: userId}}, {new: true})
      .populate({path: 'currentUsers', select: 'username'})
      .select('currentUsers')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },


}
