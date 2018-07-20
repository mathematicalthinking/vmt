const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = new mongoose.Schema({
  courseTemplates: [{type: ObjectId, ref: 'CourseTemplate'}],
  roomTemplates: [{type: ObjectId, ref: 'RoomTemplate'}],
  courses: [{type: ObjectId, ref: 'Course'}],
  rooms: [{type: ObjectId, ref: 'Room'}],
  firstName: {type: String},
  lastName: {type: String},
  username: {type: String, required: true},
  email: {type: String, validate: {
    validator: (email) => {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(email);
    }, message: '{VALUE} is not a valid email address'}
  },
  password: {type: String,}
});



module.exports = mongoose.model('User', User);
