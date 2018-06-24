const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Message = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  text: {type: String},
  room: {type: ObjectId, ref: 'Room'},
});

module.exports = mongoose.model('Message', Message);
