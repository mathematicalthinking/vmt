const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User')
const Room = new mongoose.Schema({
  roomName: {type: String},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  tabListKey: [{type: ObjectId, ref: 'Tab'}],
  chat: [{type: ObjectId, ref: 'Message'}],
});

// Method for adding Room the creators list of rooms
// @TODO for some reason I can't get $push to work
Room.post('save', doc => {
  User.findById(doc.creator, (err, res) => {
    res.rooms.push(doc._id)
    res.save()
  })
})

module.exports = mongoose.model('Room', Room);
