const db = require('../models')

module.exports = {
  get: params => {
    if (params.constructor === Array) {
      params = {'_id': {$in: params}}
    }
    params.tempRoom = false; // we don't want any temporary rooms
    return new Promise((resolve, reject) => {
      db.Room
      .find(params)
      .sort('-createdAt')
      .populate({path: 'members.user', select: 'username'})
      .populate({path: 'currentMembers.user', select: 'username'})
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
      .populate({path: 'currentMembers.user', select: 'username'})
      .populate({path: 'course', select: 'name'})
      .populate({path: 'events', select: '-room'})
      .populate({path: 'graphImage', select: 'imageData'})
      .then(room => {
        // console.log(room.graphImage)
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
        .populate({path: 'currentMembers.user', select: 'username'}, function(){(resolve(room))}) //Hmm why no support for promise here?
      })
      .catch(err => {
        console.log(err); reject(err)
      })
    })
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
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


  // THIS IS A MESS @TODO CLEAN UP 
  put: (id, body) => {
    return new Promise((resolve, reject) => {
      if (body.graphImage) {
        db.Room.findById(id).then(room => {
          db.Image.findByIdAndUpdate(room.graphImage, {imageData: body.graphImage.imageData}).then(img => {
            return resolve();
          })
        })
        .catch(err => {
          console.log(err)
          reject(err);
        })
      } else {
        db.Room.findById(id)
        .then(async room => {
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
              try { await room.save()}
              catch(err) {console.log(err)}
              room.populate({path: 'members.user', select: 'username'}, function() {
                resolve(room)
              })
            } else reject({errorMessage: 'incorrect entry code'})
          } else {
            db.Room.findByIdAndUpdate(id, body).then(res => resolve()).catch(reject())
          }
        })
        .catch(err => reject(err))        
      }
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

  // SOCKET METHODS
  addCurrentUsers: (roomId, body) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$addToSet: {currentMembers: body}}, {new: true})
      .populate({path: 'currentMembers.user', select: 'username'})
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .select('currentMembers events chat currentState roomType')
      .then(room => {
        console.log('adding current user: ', body)
        resolve(room)
      })
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, socketId) => {
    return new Promise ((resolve, reject) => {
      console.log('removing currentMember: ', socketId)
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentMembers: {socket: socketId}}}, {new: true})
      .populate({path: 'currentMembers.user', select: 'username'})
      .select('currentMembers')
      .then(room => {
        console.log(room) 
        resolve(room)
      })
      .catch(err => reject(err))
    })
  },


}
