const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User')
const Room = new mongoose.Schema({
  roomName: {type: String, required: true},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  tabListKey: [{type: ObjectId, ref: 'Tab'}],
  events: [{type: ObjectId, ref: 'Event'}],
  chat: [{type: ObjectId, ref: 'Message'}],
  currentUsers: [{type: ObjectId, ref: 'User'}],
},
{timestamps: true});

Room.pre('save', function (next) {
  console.log(this.isNew)
    this.wasNew = this.isNew;
    next();
});

// Method for adding Room the creators list of rooms
// @TODO for some reason I can't get $push to work
Room.post('save', function(doc) {
  User.findById(doc.creator, (err, res) => {
    if (err) {
      return console.log(err)
    }
    if (this.wasNew) {
      res.rooms.push(doc._id)
      res.save()
    }
  })
})

module.exports = mongoose.model('Room', Room);
