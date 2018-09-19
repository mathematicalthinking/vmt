const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Room = require('./Room.js');
const Message = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  text: {type: String},
  room: {type: ObjectId, ref: 'Room'},
  timeStamp: {type: Number}, // SAVING THIS IN UNIX TIME FOR EASY SORTING but in MS
});

// Add this message to the room's chat
// @TODO for some reason I can't get $push to work
Message.pre('save', async function() {
  await Room.findByIdAndUpdate(this.room, {$addToSet: {chat: this._id}})
})
module.exports = mongoose.model('Message', Message);
