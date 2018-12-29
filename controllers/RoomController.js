const db = require('../models')
const Room = require('../models/Room')
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const _ = require('lodash');

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
  // WHAT I SHOULD ACTUALLY BE DOING HERE IS CREATING new Schemas saving their respective ids within each other and then write to the db once
  post: body => {
    return new Promise(async (resolve, reject) => {
      let createdRoom;
      let existingTabs;
      if (body.tabs) {
        existingTabs = Object.assign(body.tabs, [])
      } else if (body.activities) {
        try {
          let activities = await db.Activity.find({'_id': {$in: body.activities}}).populate('tabs')
          existingTabs = activities.reduce((acc, activity) => (
            acc.concat(activity.tabs)
          ), [])
        }
        catch(err) {reject(err)}
      }
      delete body.tabs
      db.Room.create(body)
      .then(room => {
        createdRoom = room;
        if (!existingTabs) {
          return db.Tab.create({
            name: 'Tab 1',
            room: room._id,
            desmosLink: body.desmosLink,
            ggbFile: body.ggbFile,
            tabType: body.roomType,
          })
        }
        else {
          return Promise.all(existingTabs.map(tab => {
            delete tab._id;
            delete tab.activity;
            tab.startingPoint = tab.currentState;
            tab.room = createdRoom._id;
            return db.Tab.create(tab)
          }))
        }
      })
      .then(tab => {
        if (Array.isArray(tab)) {
          return db.Room.findByIdAndUpdate(createdRoom._id, {$addToSet: {tabs: tab.map(tab => tab._id)}}, {new: true})
          .populate({path: 'members.user', select: 'username'})
          .populate({path: 'currentMembers.user', select: 'username'})
        } else {
          return db.Room.findByIdAndUpdate(createdRoom._id, {$addToSet: {tabs: tab._id}}, {new: true})
          .populate({path: 'members.user', select: 'username'})
          .populate({path: 'currentMembers.user', select: 'username'})
        }
      })
      .then(room => resolve(room)) //Hmm why no support for promise here?
      .catch(err => {
        // TRY TO DELETE @TODO ERROR HANDLING HERE IF FAIL DELETE BOTH FROM DB AND RETURN ERROR TO THE USER
        console.log(err); reject(err)
      })
    })
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      // Send a notification to user that they've been granted access to a new course

      let members;
      let room;
        db.Room.findByIdAndUpdate(id, {$addToSet: body}, {new: true})
        .populate({path: 'members.user', select: 'username'})
        .then((res) => {
          room = res;
          return db.User.findByIdAndUpdate(body.members.user, {
            $addToSet: {
              rooms: id
            }
          })
        })
        .then(() => {
          members = room.members;
          return db.Notification.create({
            resourceType: 'room',
            resourceId: id,
            toUser: body.members.user,
            notificationType: 'grantedAccess',
            parentResource: room.course
          })
        })
        .then(() => resolve(members))
        .catch(err => reject(err))
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
        let roomToPopulate;
        let fromUser;
        db.Room.findById(id)
          .then((room) => {
            let { entryCode, userId } = body.checkAccess;
            fromUser = userId;
            if (room.entryCode !== entryCode) {
             throw('Incorrect Entry Code');
            }
            // correctCode, update room with user
            if (_.find(room.members, member => member.user.toString() === userId)) {
              throw('You already have been granted access to this room!');
            }

            room.members.push({user: userId, role: 'participant'})
            return room.save()

          })
          .then((updatedRoom) => {
            // create notifications
            roomToPopulate = updatedRoom
            let facilitators = updatedRoom.members.filter((m) => {
              return m.role === 'facilitator';
            });
            return Promise.all(facilitators.map((f) => {
              return db.Notification.create({
                resourceType: 'room',
                resourceId: roomToPopulate._id,
                notificationType: 'newMember',
                toUser: f.user,
                fromUser: fromUser,
                parentResource: roomToPopulate.course

              });
            }));
          })
          .then(() => {
            roomToPopulate.populate({path: 'members.user', select: 'username'}, function() {
              resolve(roomToPopulate)
            })
          })
          .catch((err) => reject(err))
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
