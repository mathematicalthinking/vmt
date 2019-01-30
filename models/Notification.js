const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const sockets = require('../socketInit');
const _ = require('lodash');

const Notification = new mongoose.Schema({
  notificationType: { type: String, enum: ['grantedAccess', 'requestAccess', 'assignedNewRoom', 'newMember', 'invitation'], required: true },
  resourceType: {type: String, enum: ['room', 'course'], required: true},
  resourceId: { type: String, validate: { validator: (id) => {
    var idRegex = /^[0-9a-fA-F]{24}$/;
    return idRegex.test(id);
  }, message: '{VALUE} is not a valid resource Id'}, required: true },
  parentResource: { type: ObjectId, ref: 'Course' },
  fromUser: {type: ObjectId, ref: 'User'},
  toUser: { type: ObjectId, ref: 'User'},
  isTrashed: { type: Boolean, default: false },
},
{timestamps: true});

function updateUser(userId, query) {
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(userId, query, {new: true}, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

function buildEmitData(notification, next) {
  // Requiring room at the top of file was causing problems
  const Room = require('./Room');
  const Course = require('./Course');

  return new Promise((resolve, reject) => {
    let emitData = {};
    let type = notification.notificationType;
    let resource = notification.resourceType;
    notification.populate({path: 'fromUser'}, (err, ntf) => {
      if (err) {
        return reject(err);
      }
      emitData.notification = ntf;

      if (type === 'grantedAccess' || type === 'assignedNewRoom') {
        if (resource === 'course') {
          Course.findById(notification.resourceId).populate({path: 'members.user', select: 'username'}).exec((err, course) => {
            if (err) {
              return reject(err);
            }
            emitData.course = course;
            return resolve(emitData);
          })
        } else {
          Room.findById(notification.resourceId).populate({path: 'members.user', select: 'username'}).exec((err, room) => {
            if (err) {
              return reject(err);
            }
            emitData.room = room;
            return resolve(emitData);
          })
        }
      } else {
        return resolve(emitData);
      }
    })
  });
}
// update toUser with notification
Notification.post('save', function(notification) {
  if (notification.toUser) {
    let ntfType = notification.notificationType;

    let method = notification.isTrashed ? '$pull' : '$addToSet';
    // Add a room the users list if they've been assigned
    let updateQuery = {
      [method]: {notifications: notification._id}
    }
    if (ntfType === 'assignedNewRoom' && method === '$addToSet') {
      updateQuery['$addToSet'].rooms = notification.resourceId;
    }
    // granted access - send course along with ntf
    // assigned new room - send room along with ntf
    return updateUser(notification.toUser, updateQuery)
    .then((updatedUser) => {
      // check if there is socket for user
      if (!notification.isTrashed) {
        let socketId = _.propertyOf(updatedUser)('socketId');
        let socket = _.propertyOf(sockets)(`io.sockets.sockets.${socketId}`);

        if (socket) {
          return buildEmitData(notification)
          .then((data) => {
            if (data) {
              return socket.emit('NEW_NOTIFICATION', data);
            }
          })
        }
      }
      return;
    })
    .catch((err) => {
      console.log('err post save ntf', err);
      next(err)
    });

  }
});

module.exports = mongoose.model('Notification', Notification);
