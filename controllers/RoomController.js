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
      .populate({path: 'currentUsers', select: 'username'})
      .then(rooms => {
        rooms = rooms.map(room => room.tempRoom ? room : room.summary())
        resolve(rooms)})
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      // .populate({path: 'creator', select: 'username'})
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .populate({path: 'members.user', select: 'username'})
      .populate({path: 'notifications.user', select: 'username'})
      .populate({path: 'currentUsers', select: 'username'})
      .populate({path: 'course', select: 'name'})
      .populate({path: 'events', select: '-room'})
      .then(room => {
        resolve(room)
      })
      .catch(err => reject(err))
    });
  },
  post: body => {
    return new Promise((resolve, reject) => {
      db.Room.create(body)
      .then(room => {
        if (body.course) {
          room.populate({path: 'course', select: 'name'})
        }
        room
        .populate({path: 'members.user', select: 'username'})
        .populate({path: 'currentUsers', select: 'username'}, function(){(resolve(room))}) //Hmm why no support for promise here?
      })
      .catch(err => {
        console.log(err); reject(err)
      })
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .then(room => {
        if (body.checkAccess) {
          let { entryCode, userId } = body.checkAccess;
          // @todo SHOULD PROBABLY HASH THIS
          if (room.entryCode === entryCode) {
            room.members.push({user: userId, role: 'student'})
            // Send a notification to the room owner
            db.User.findByIdAndUpdate(room.creator, {
              $addToSet: {
                'roomNotifications.access': {
                  notificationType: 'newMember', _id: room._id, user: userId 
                }
              }
            }, {new: true})
            .then(user => console.log("USER: AFTER ADDING NTF: ", user))
          } else reject({errorMessage: 'incorrect entry code'})
        } else if (body.newMember) {
          room.members.push({role: 'student', user: body.newMember})
        }
        // else {
        //   // THIS NEEDS TO CHANGE BELOW WE ALREADY HAVE THE ROOM DON"T NEED TO FIND
        //   db.Room.findByIdAndUpdate(id, body, {new: true})
        //   .then(room => {resolve(body)})
        //   .catch(err => {console.log(err); reject(err)})
        // }
        room.save()
        room.populate({path: 'members.user', select: 'username'}, function() {
          resolve(room)
        })
      })
      .catch(err => reject(err))
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
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .select('currentUsers events chat currentState tempId')
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
