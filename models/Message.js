const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Room = require('./Room.js');
const Message = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  text: {type: String},
  room: {type: ObjectId, ref: 'Room'},
  timestamp: {type: Date},
});

// Add this message to the room's chat
// @TODO for some reason I can't get $push to work
Message.pre('save', function(next) {
  Room.findByIdAndUpdate(this.room, {$addToSet: {chat: this._id}})
  .then(next())
})
module.exports = mongoose.model('Message', Message);
