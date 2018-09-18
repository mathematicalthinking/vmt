const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Room = require('./Room.js');
const Event = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  event: {type: String},
  room: {type: ObjectId, ref: 'Room'},
});

Event.pre('save', async function() {
  console.log('saving event to room')

  // tabs[this.tabIndex].events.push(this._id)
  await Room.findByIdAndUpdate(this.room, {$addToSet: {'tabs.$[].events': this.tabIndex}})
})
module.exports = mongoose.model('Event', Event);
