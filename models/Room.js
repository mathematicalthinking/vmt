const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User')
const Room = new mongoose.Schema({
  template: {type: ObjectId, ref: 'RoomTemplate'},
  name: {type: String},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  events: [{type: ObjectId, ref: 'Event'}],
  chat: [{type: ObjectId, ref: 'Message'}],
  currentUsers: [{type: ObjectId, ref: 'User'}],
  isPublic: {type: Boolean, default: false}
},
{timestamps: true});

Room.pre('save', function (next) {
  console.log(this.isNew)
    this.wasNew = this.isNew;
    next();
});

Room.post('save', function(doc) { // intentionally not using arrow functions
  // so 'this' refers to the model
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
