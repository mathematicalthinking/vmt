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

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      console.log(body.members)
      // Send a notification to user that they've been granted access to a new course
      db.User.findByIdAndUpdate(body.members.user, {
        $addToSet: {
          rooms: id,
          'roomNotifications.access': {
            notificationType: 'grantedAccess',
            _id: id,
          }
        }
      }, {new: true})
      .then(res => console.log("RESSS: r", res))
      db.Room.findByIdAndUpdate(id, {$addToSet: body}, {new: true})
      .populate({path: 'members.user', select: 'username'})
      .then(res => {
        resolve(res.members)})
      .catch(err => reject(err))
    })
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      // Remove this course from the user's list of courses
      db.User.findByIdAndUpdate(body.members.user, {$pull: {rooms: id}})
      db.Room.findByIdAndUpdate(id, {$pull: body}, {new: true})
      .populate({path: 'members.user', select: 'username'})
      .then(res => resolve(res.members))
      .catch(err => reject(err))
    })
  },



  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
      .then(room => {
        // if (body.newMember) {
        //   room.members.push({role: 'participant', user: body.newMember})
        //   db.User.findByIdAndUpdate(body.newMember, {
        //     $addToSet: {
        //       rooms: room._id,
        //       'roomNotifications.access': {
        //         notificationType: 'grantedAccess',
        //         _id: room._id,
        //       }
        //     }
        //   }, {new: true}).then(user => console.log("NEW USER: ", user))
        // }
        if (body.checkAccess) {
          let { entryCode, userId } = body.checkAccess;
          // @todo SHOULD PROBABLY HASH THIS
          if (room.entryCode === entryCode) {
            room.members.push({user: userId, role: 'participant'})
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
        } else {
          db.Room.findByIdAndUpdate(id, body)
          .then(resolve())
        }
        // else {
        //   // THIS NEEDS TO CHANGE BELOW WE ALREADY HAVE THE ROOM DON"T NEED TO FIND
        //   db.Room.findByIdAndUpdate(id, body, {new: true})
        //   .then(room => {resolve(body)})
        //   .catch(err => {console.log(err); reject(err)})
        // }
        if (room) {
          room.save()
          room.populate({path: 'members.user', select: 'username'}, function() {
            resolve(room)
          })
        }
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
  addCurrentUsers: (roomId, body) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$addToSet: {currentUsers: body}}, {new: true})
      .populate({path: 'currentUsers.user', select: 'username'})
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .select('currentUsers events chat currentState tempId')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, socketId) => {
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentUsers: {socket: socketId}}}, {new: true})
      .populate({path: 'currentUsers.user', select: 'username'})
      .select('currentUsers')
      .then(room => resolve(room))
      .catch(err => reject(err))
    })
  },


}
