const db = require('../models')
const Room = require('../models/Room')
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
module.exports = {
  get: params => {
    if (params && params.constructor === Array) {
      params = {'_id': {$in: params}}
    } else {
      params = params ? params : {} 
      params.tempRoom = false; // we don't want any temporary rooms
    }
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
      .populate({path: 'creator', select: 'username'})
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .populate({path: 'members.user', select: 'username'})
      .populate({path: 'currentMembers.user', select: 'username'})
      .populate({path: 'course', select: 'name'})
      .populate({path: 'tabs', populate: {path: 'events'}})
      .populate({path: 'graphImage', select: 'imageData'})
      .then(room => {
        resolve(room)
      })
      .catch(err => reject(err))
    });
  },
  post: body => {
    return new Promise((resolve, reject) => {
      let createdRoom;
      db.Room.create(body)
      .then(room => {
        createdRoom = room;
        return db.Tab.create({
          name: 'Tab 1',
          room: room._id,
          desmosLink: body.desmosLink,
          ggbFile: body.ggbFile,
          tabType: body.roomType,
        })
      })
      .then(tab => {
        db.Room.findByIdAndUpdate(createdRoom._id, {$addToSet: {tabs: tab._id}}, {new: true})
        .populate({path: 'members.user', select: 'username'})
        .populate({path: 'currentMembers.user', select: 'username'})
        .then(room => resolve(room)) //Hmm why no support for promise here?
      })
      .catch(err => {
        // TRY TO DELETE @TODO ERROR HANDLING HERE IF FAIL DELETE BOTH FROM DB AND RETURN ERROR TO THE USER
        console.log(err); reject(err)
      })
    })
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      // Send a notification to user that they've been granted access to a new course
      db.User.findByIdAndUpdate(body.members.user, { //WE SHOULD AWAIT THIS TO MAKE SURE IT GOES THROUGH>???
        $addToSet: {
          rooms: id,
          'roomNotifications.access': {
            notificationType: 'grantedAccess',
            _id: id,
          }
        }
      }, {new: true})
      .then(res => {
        db.Room.findByIdAndUpdate(id, {$addToSet: body}, {new: true})
        .populate({path: 'members.user', select: 'username'})
        .then(res => {
          resolve(res.members)})
        .catch(err => reject(err))
      })
      .catch(err => {
        reject(err)
      })
    })
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      // Remove this course from the user's list of courses
      // console.log(bod['members.user']._id)
      db.User.findByIdAndUpdate(body.members.user, {$pull: {rooms: id}})
      db.Room.findByIdAndUpdate(id, {$pull: body}, {new: true})
      .populate({path: 'members.user', select: 'username'})
      .then(res => {
        resolve({members: res.members})
      })
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
      } 
      else if (body.checkAccess) {
        db.Room.findById(id)
        .then(async room => {
          let { entryCode, userId } = body.checkAccess;
          // @todo SHOULD PROBABLY HASH THIS
          if (room.entryCode === entryCode) {
            room.members.push({user: userId, role: 'participant'})
            // Send a notification to the room owner
            // THIS NESTED PROMISE IS AN ANTI-PATTERN
            db.User.findByIdAndUpdate(room.creator, {
              $addToSet: {
                'roomNotifications.access': {
                  notificationType: 'newMember', _id: room._id, user: userId 
                }
              }
            })
            .then(res => {})
            .catch(err => console.log(err))
            try { await room.save()}
            catch(err) {console.log(err)}
            room.populate({path: 'members.user', select: 'username'}, function() {
              resolve(room)
            })
          } else reject({errorMessage: 'incorrect entry code'})
        })
        .catch(err => reject(err))
      }
      else if (Object.keys(body)[0] === 'tempRoom') {
        db.Room.findById(id)
        .then(async room => {
          room.tempRoom = body.tempRoom
          try {
            await room.save()
            resolve();
          }
          catch(err) {
            console.log(err)
            reject(err)
          }
        })
      } 
      else {
        db.Room.findByIdAndUpdate(id, body, {new: true})
        .populate('currentMembers.user members.user', 'username')
        .populate('chat') // this seems random
        .then(res => resolve(res)).catch(err =>{
          console.log("ERR: ", err)
          reject(err)
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
  addCurrentUsers: (roomId, body, members) => {
    return new Promise((resolve, reject) => {
      // IF THIS IS A TEMP ROOM MEMBERS WILL HAVE A VALYE 
      let query = members ? 
        {'$addToSet': {'currentMembers': body, 'members': members}} :
        {'$addToSet': {'currentMembers': body}}
      db.Room.findByIdAndUpdate(roomId, query, {new: true})
      .populate({path: 'currentMembers.user', select: 'username'})
      .populate({path: 'chat', populate: {path: 'user', select: 'username'}, select: '-room'})
      .select('currentMembers events chat currentState roomType')
      .then(room => {
        resolve(room)
      })
      .catch(err => reject(err))
    })
  },

  removeCurrentUsers: (roomId, userId) => {
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentMembers: {user: userId}}}) // DONT RETURN THE NEW DOCUMENT WE NEED TO KNOW WHO WAS REMOVED BACK IN THE SOCKET
      .populate({path: 'currentMembers.user', select: 'username'})
      .select('currentMembers controlledBy')
      .then(room => {
        resolve(room)
      })
      .catch(err => reject(err))
    })
  },


}
