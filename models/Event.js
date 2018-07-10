const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Room = require('./Room.js');
const Event = new mongoose.Schema({
  user: {type: ObjectId, ref: 'User'},
  event: {type: String},
  room: {type: ObjectId, ref: 'Room'},
});

// Add this message to the room's chat
// @TODO for some reason I can't get $push to work
Event.post('save', doc => {
  Room.findById(doc.room, (err, res) => {
    res.events.push(doc._id)
    res.save()
    // .then(res => console.log('all good'))
    // .catch(err => console.log("ERR: ",err))
  })
})
module.exports = mongoose.model('Event', Event);
