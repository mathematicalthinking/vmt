const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Tab = require('./Tab.js');
const Event = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  event: {type: String}, // ggb xml
  definition: {type: String}, // specific to ggb
  label: {type: String}, // specific to ggb
  description: {type: String},
  room: {type: ObjectId, ref: 'Room', required: true},
  tab: {type: ObjectId, ref: 'Tab', required: true},
  eventType: {type: String, enum: ['ADD', 'REMOVE', 'UPDATE']},
  timestamp: {type: Number} //UNIX TIME but in MS
});

Event.pre('save', async function() {
  // tabs[this.tabIndex].events.push(this._id)
  await Tab.findByIdAndUpdate(this.tab, {$addToSet: {events: this._id}})
})
module.exports = mongoose.model('Event', Event);
