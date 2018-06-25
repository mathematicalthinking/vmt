const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = new mongoose.Schema({
  courseName: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  username: {type: String, required: true},
  email: {type: String, required: true, validate: {
    validator: (email) => {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(email);
    }, message: '{VALUE} is not a valid email address'}
  },
  creator: {type: ObjectId, ref: 'User'},
  nextRoom: {type: ObjectId, ref: 'Room'},
  rooms: [{type: ObjectId, ref: 'Room'}]
});

module.exports = mongoose.model('User', User);
