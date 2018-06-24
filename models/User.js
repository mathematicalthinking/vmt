const mongoose = require('mongoose');
const ObjectId = mongoose.types.ObjectId;
const User = new mongoose.Schema({
  courseName: {type: String},
  firstName: {type: String},
  lastName: {type: String},
  username: {type: String, required: true},
  email: {type: String, required: true, validate: (email) => {
    var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    return emailRegex.test(email);
  }, 'The e-mail field cannot be empty.')}
  creator: {type: ObjectId, ref: 'User'},
  nextRoom: {type: ObjectId, ref: 'Room'},
  rooms: [{type: ObjectId, ref: 'Room'}]
});

module.exports = mongoose.model('User', User);
