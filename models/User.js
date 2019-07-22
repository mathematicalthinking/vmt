const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = new mongoose.Schema(
  {
    courseTemplates: {
      type: [{ type: ObjectId, ref: 'CourseTemplate' }],
      default: [],
    },
    courses: { type: [{ type: ObjectId, ref: 'Course' }], default: [] },
    rooms: { type: [{ type: ObjectId, ref: 'Room' }], default: [] },
    activities: { type: [{ type: ObjectId, ref: 'Activity' }], default: [] },
    notifications: {
      type: [{ type: ObjectId, ref: 'Notification' }],
      default: [],
    },
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String, required: true },
    email: {
      type: String,
      validate: {
        validator: email => {
          var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
          return emailRegex.test(email);
        },
        message: '{VALUE} is not a valid email address',
      },
    },
    accountType: { type: String, enum: ['participant', 'facilitator', 'temp'] },
    bothRoles: { type: Boolean, default: false },
    // password: {
    //   type: String,
    //   required: function() {
    //     return this.accountType !== 'temp';
    //   },
    // },
    isAdmin: { type: Boolean, default: false },
    seenTour: { type: Boolean, default: false },
    socketId: { type: String },
    token: { type: String }, // For Authentication Encompass users,
    tokenExpiryDate: { type: Date }, // // For Authentication Encompass users
    isTrashed: { type: Boolean, default: false },
    ssoId: { type: ObjectId },
    ipAddresses: [{type: String}],
    latestIpAddress: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', User);
