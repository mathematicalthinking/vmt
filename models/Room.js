const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Assignment = require('./Assignment');
const Room = new mongoose.Schema({
  assignment: {type: ObjectId, ref: 'RoomTemplate'},
  name: {type: String},
  description: {type: String},
  roomType: {type: String, default: 'geogebra'},
  course: {type: ObjectId, ref: 'Course'},
  creator: {type: ObjectId, ref: 'User', required: true},
  dueDate: {type: Date,},
  events: [{type: ObjectId, ref: 'Event'}],
  chat: [{type: ObjectId, ref: 'Message'}],
  members: [{
    user: {type: ObjectId, ref: 'User'},
    role: {type: String},
    _id: false}],
  currentUsers: {type: [{type: ObjectId, ref: 'User'}], default: []},
  tabs: [{
    ggbFile: {type: String,},
    desmosLink: {type: String,},
    _id: false,
  }],
  isPublic: {type: Boolean, default: false}
},
{timestamps: true});

Room.pre('save', function (next) {
  // ON CREATION UPDATE THE CONNECTED MODELS
  if (this.isNew) {
    const promises = [];
    const users = this.members.map(member => member.user)
    promises.push(User.find({'_id': {$in: users}}))
    if (this.course) {
      promises.push(Course.findByIdAndUpdate(this.course, {$addToSet: {rooms: this._id}}))
    }
    if (this.assignment) {
      promises.push(Assignment.findByIdAndUpdate(this.assignment, {$addToSet: {rooms: this._id}}))
    }
    Promise.all(promises)
    .then(values => {
      values[0].forEach(user => {
        user.rooms.push(this._id)
        console.log("USER: ", user)
        // DONT THINK WE NEED THE CODE BWLOW...THE USER SHOULD ALREADY HAVE
        // THE ASSIGNMENT AND THE COURSE IN THEIR RESOURCES 
        // if (this.course) user.courseNotifications.newRoom.push({notificationType: 'newRoom', _id: this.course})
        // if (this.assignment) user.assignments.push(this.assignment)
        user.save();
        next()
      })
    })
    .catch(err => next(err))
  } else {next()}
});
Room.pre('remove', async function() {
  const promises = []
  if (this.course) {
    promises.push(Course.findByIdAndUpdate(this.course, {$pull: {rooms: this._id}}))
  }
  promises.push(User.update({_id: {$in: this.members.map(member => member.user)}}, {
    $pull: {
      rooms: this._id,
      'roomNotifications.access': {_id: this._id},
      'roomNotications.newRoom': {_id: this._id}
    }
  }, {multi: true}))
  await Promise.all(promises)
})

module.exports = mongoose.model('Room', Room);
