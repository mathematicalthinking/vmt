const db = require('../models')
const Tab = db.Tab;
const Room = db.Room;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
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
        // rooms = rooms.map(room => room.tempRoom ? room : room.summary())
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
      .populate({path: 'currentMembers', select: 'username'})
      .populate({path: 'course', select: 'name'})
      .populate({path: 'tabs', populate: {path: 'events'}})
      .populate({path: 'graphImage', select: 'imageData'})
      .then(room => {resolve(room)})
      .catch(err => reject(err))
    });
  },

  post: body => {
    return new Promise(async (resolve, reject) => {
      // Prepare the tabs if they exist
      let existingTabs;
      if (body.tabs) {
        existingTabs = Object.assign([], body.tabs)
      } else if (body.activities) {
        try {
          let activities = await db.Activity.find({'_id': {$in: body.activities}}).populate('tabs')
          existingTabs = activities.reduce((acc, activity) => (
            acc.concat(activity.tabs)
            ), [])
          }
        catch(err) {reject(err)}
      }
      let tabModels;
      delete body.tabs;
      // delete body.roomType;
      let ggbFiles;

      if (Array.isArray(body.ggbFiles)) {
        ggbFiles = [...body.ggbFiles];
        delete body.ggbFiles;
      }


      let room = new Room(body)
      if (existingTabs) {
        tabModels = existingTabs.map(tab => {
          let newTab = new Tab({
            name: tab.name,
            room: room._id,
            ggbFile: tab.ggbFile,
            desmosLink: body.desmosLink,
            currentState: tab.currentState,
            startingPoint: tab.startingPoint,
            tabType: tab.tabType,
          });
          return newTab;
        })
      } else {
        if (Array.isArray(ggbFiles) && ggbFiles.length > 0) {
          tabModels = ggbFiles.map((file, index) => {
            return new Tab({
              name: `Tab ${index + 1}`,
              room: room._id,
              ggbFile: file,
              tabType: body.roomType,
            })
          })
        } else {
          tabModels = [new Tab({
            name: 'Tab 1',
            room: room._id,
            desmosLink: body.desmosLink,
            tabType: body.roomType || 'geogebra',
          })]
        }
      }
      room.tabs = tabModels.map(tab => tab._id);
      try {
        await tabModels.forEach(tab => tab.save()) // These could run in parallel I suppose but then we'd have to edit one if ther ewas a failuer with the other
        await room.save()
        room.populate({path: 'members.user', select: 'username'}, (err, room) => {
          if (err) reject(err);
          resolve(room)
        })
      } catch (err) {reject(err)}
    })
  },

  add: (id, body,) => {
    return new Promise((resolve, reject) => {
      // Send a notification to user that they've been granted access to a new course

      let members;
      let room;
      let ntfType = body.ntfType;
      delete body.ntfType;
      console.log(ntfType)
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
            notificationType: ntfType,
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
          .catch((err) => {
            reject(err)
          })
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
      else if (body.isTrashed) {
        let updatedRoom;
        db.Room.findById(id)
        .then(async room => {
          room.isTrashed = true;
          try {
            updatedRoom = await room.save()
          } catch(err) {reject(err)}
          // let userIds = room.members.map(member => member.user);
          // // delete this room from any courses
          // let promises = [db.User.update({_id: {$in: userIds}}, {$pull: {rooms: room._id}}, {multi: true})];
          if (room.course) {
            return db.Course.findByIdAndUpdate(room.course, {$pull: {rooms: room._id}})
          } else (resolve(updatedRoom))
        })
        .then(() => {
          resolve(updatedRoom)
        })
        .catch(err => reject(err))
      }
      else {
        db.Room.findByIdAndUpdate(id, body, {new: true})
        .populate('currentMembers.user members.user', 'username')
        .populate('chat') // this seems random
        .then(res => resolve(res)).catch(err => {
          if (body.isTrashed) {
            res
          }
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
  addCurrentUsers: (roomId, newCurrentUserId, members) => {
    return new Promise(async (resolve, reject) => {
      // IF THIS IS A TEMP ROOM MEMBERS WILL HAVE A VALYE
      let query = members ?
        {'$addToSet': {'currentMembers': newCurrentUserId, 'members': members}} :
        {'$addToSet': {'currentMembers': newCurrentUserId}}
      db.Room.findByIdAndUpdate(roomId, query, {new: true})
      .populate({path: 'currentMembers', select: 'username'})
      .populate({path: 'members.user', select: 'username'})
      .select('currentMembers members')
      .then(room => {
        resolve(room)
      })
      .catch((err) =>  reject(err))
    })
  },

  removeCurrentUsers: (roomId, userId) => {
    return new Promise ((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, {$pull: {currentMembers: userId}}) // dont return new! we need the original list to filter back in sockets.js
      .populate({path: 'currentMembers', select: 'username'})
      .select('currentMembers controlledBy')
      .then(room => {
        resolve(room)
      })
      .catch(err => reject(err))
    })
  },


}
