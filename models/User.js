const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = new mongoose.Schema({
  courses: {type: Array},
  firstName: {type: String},
  lastName: {type: String},
  username: {type: String, required: true},
  email: {type: String, validate: {
    validator: (email) => {
      var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
      return emailRegex.test(email);
    }, message: '{VALUE} is not a valid email address'}
  },
});

module.exports = mongoose.model('User', User);
