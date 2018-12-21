const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');

const Notification = new mongoose.Schema({
  notificationType: { type: String, enum: ['grantedAccess', 'requestAccess', 'assignedNewRoom', 'newMember'], required: true },
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

// update toUser with notification
Notification.post('save', function(notification) {
  if (notification.toUser) {
    let method = notification.isTrashed ? '$pull' : '$addToSet';

    User.findByIdAndUpdate(notification.toUser, {[method]: {
      notifications: notification._id
    }}, {new: true}, (err, res) => {
      if (err) {
        console.log('err', err);
      }
    });
  }
});

module.exports = mongoose.model('Notification', Notification);
