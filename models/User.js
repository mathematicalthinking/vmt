const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = new mongoose.Schema({
  courseTemplates: {type: [{type: ObjectId, ref: 'CourseTemplate'}], default: []},
  courses: {type: [{type: ObjectId, ref: 'Course'}], default: []},
  rooms: {type: [{type: ObjectId, ref: 'Room'}], default: []},
  assignments: {type: [{type: ObjectId, ref: 'Assignment'}], default: []},
  roomNotifications: {
    access: [{
      notificationType: String, // grantAccess || requestAccess
      _id: {type: ObjectId, ref: 'Room'},
      user: {type: ObjectId, ref: 'User'},
    }],
    newRoom: [{
      _id: {type: ObjectId, ref: 'Room'}
    }]
  },
  courseNotifications: {
    access: [{
      notificationType: String,
      _id: {type: ObjectId, ref: 'Course'},
      user: {type: ObjectId, ref: 'User'},
    }],
    newRoom: [{
      notificationType: String,
      _id: {type: ObjectId, ref: 'Course'},
    }]
  },
  firstName: {type: String},
  lastName: {type: String},
  username: {type: String, required: true},
  email: {type: String, validate: {
    validator: (email) => {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(email);
    }, message: '{VALUE} is not a valid email address'}
  },
  password: {type: String, required: true},
  accountType: {type: String,},
  seenTour: {type: Boolean, default: false},
}, {timestamps: true});

module.exports = mongoose.model('User', User);
