const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;
// const _ = require('lodash');
const User = require('./User');
const sockets = require('../socketInit');

const Notification = new mongoose.Schema(
  {
    notificationType: {
      type: String,
      enum: [
        'grantedAccess',
        'requestAccess',
        'assignedNewRoom',
        'newMember',
        'invitation',
      ],
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['room', 'course', 'activity'],
      required: true,
    },
    resourceId: {
      type: String,
      validate: {
        validator: (id) => {
          const idRegex = /^[0-9a-fA-F]{24}$/;
          return idRegex.test(id);
        },
        message: '{VALUE} is not a valid resource Id',
      },
      required: true,
    },
    parentResource: { type: ObjectId, ref: 'Course' },
    fromUser: { type: ObjectId, ref: 'User' },
    toUser: { type: ObjectId, ref: 'User' },
    isTrashed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

function updateUser(userId, query) {
  // console.log('query: ', query);
  return new Promise((resolve, reject) => {
    User.findByIdAndUpdate(userId, query, { new: true }, (err, res) => {
      // console.log(res.notifications);
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
}

function buildEmitData(notification) {
  // Requiring room at the top of file was causing problems
  const Room = require('./Room');
  const Course = require('./Course');

  return new Promise((resolve, reject) => {
    const emitData = {};
    const type = notification.notificationType;
    const resource = notification.resourceType;
    notification.populate(
      { path: 'fromUser', select: '_id username' },
      (err, ntf) => {
        if (err) {
          return reject(err);
        }
        emitData.notification = ntf;

        if (
          type === 'grantedAccess' ||
          type === 'assignedNewRoom' ||
          type === 'invitation'
        ) {
          // if this ntf signifies a new resource send that resource to user so they can add it to their store
          if (resource === 'course') {
            return Course.findById(notification.resourceId)
              .populate({ path: 'members.user', select: 'username' })
              .exec((err, course) => {
                if (err) {
                  return reject(err);
                }
                emitData.course = course;
                return resolve(emitData);
              });
          }
          return Room.findById(notification.resourceId)
            .populate({ path: 'members.user', select: 'username' })
            .exec((err, room) => {
              if (err) {
                return reject(err);
              }
              emitData.room = room;
              return resolve(emitData);
            });
        }
        return resolve(emitData);
      }
    );
  });
}

// update toUser with notification
Notification.post('save', async function(notification, next) {
  if (notification.toUser) {
    const ntfType = notification.notificationType;

    const method = notification.isTrashed ? '$pull' : '$addToSet';
    // Add a room the users list if they've been assigned
    const updateQuery = {
      [method]: { notifications: notification._id },
    };
    if (ntfType === 'assignedNewRoom' && method === '$addToSet') {
      updateQuery.$addToSet.rooms = notification.resourceId;
    }
    // granted access - send course along with ntf
    // assigned new room - send room along with ntf

    try {
      const updatedUser = await updateUser(notification.toUser, updateQuery);
      const socketId = updatedUser && updatedUser.socketId;
      const data = await buildEmitData(notification);
      return socketId && data
        ? sockets.io.in(socketId).emit('NEW_NOTIFICATION', data)
        : null;
    } catch (err) {
      console.log('err post save ntf', err);
      return next(err);
    }
  }
  return next();
});

module.exports = mongoose.model('Notification', Notification);
