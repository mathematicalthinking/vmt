const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Room = require('./Room.js');
const Event = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  event: {type: String},
  definition: {type: String},
  label: {type: String},
  description: {type: String},
  room: {type: ObjectId, ref: 'Room'},
  eventType: {type: String, enum: ['ADD', 'REMOVE', 'UPDATE']},
  timestamp: {type: Number} //UNIX TIME but in MS
});

Event.pre('save', async function() {
  // tabs[this.tabIndex].events.push(this._id)
  await Room.findByIdAndUpdate(this.room, {$addToSet: {events: this._id}})
})
module.exports = mongoose.model('Event', Event);
