const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Room = new mongoose.Schema({
  template: {type: ObjectId, ref: 'RoomTemplate'},
  name: {type: String},
  description: {type: String},
  course: {type: ObjectId, ref: 'Course'},
  creator: {type: ObjectId, ref: 'User', required: true},
  events: [{type: ObjectId, ref: 'Event'}],
  chat: [{type: ObjectId, ref: 'Message'}],
  members: [{user: {type: ObjectId, ref: 'User'}, role: {type: String}, _id: false}],
  currentUsers: [{type: ObjectId, ref: 'User'}],
  tabs: [{
    ggbFile: {type: String,},
    desmosLink: {type: String,},
    _id: false,
  }],
  notifications: [{user: {type: ObjectId, ref: 'User'}, notificationType: {type: String}}],
  isPublic: {type: Boolean, default: false}
},
{timestamps: true});

Room.pre('save', function (next) {
  console.log(this.isNew)
    this.wasNew = this.isNew;
    next();
});

Room.post('save', function(doc) { // intentionally not using arrow functions so 'this' refers to the model
  // If this is a post request hook
  if (this.wasNew) {
    User.findById(doc.creator, (err, res) => {
      if (err) {
        return console.log(err)
      }
      if (!res.rooms) {res.rooms = [doc._id]}
      else {res.rooms.push(doc._id)}
      res.save();
    })
    if (doc.course) {
      Course.findById(doc.course, (err, res) => {
        if (err) {return console.log(err)}
        if (!res.rooms) {res.rooms = [doc._id]}
        else {res.rooms.push(doc._id)}
        res.save();
      })
    }
  }
})

module.exports = mongoose.model('Room', Room);
