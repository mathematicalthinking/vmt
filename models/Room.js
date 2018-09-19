const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Activity = require('./Activity');
const Room = new mongoose.Schema({
  activity: {type: ObjectId, ref: 'Activity'},
  name: {type: String, required: true},
  description: {type: String},
  entryCode: {type: String},
  roomType: {type: String, default: 'geogebra'},
  course: {type: ObjectId, ref: 'Course'},
  creator: {type: ObjectId, ref: 'User', required: true},
  dueDate: {type: Date,},
  chat: [{type: ObjectId, ref: 'Message'}],
  members: [{
    user: {type: ObjectId, ref: 'User'},
    role: {type: String},
    _id: false}],
  currentUsers: {type: [{type: ObjectId, ref: 'User'}], default: []},
  ggbFile: {type: String,},
  desmosLink: {type: String,},
  events: [{type: ObjectId, ref: 'Event', _id: false}],
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
    if (this.activity) {
      promises.push(Activity.findByIdAndUpdate(this.activity, {$addToSet: {rooms: this._id}}))
    }
    Promise.all(promises)
    .then(values => {
      values[0].forEach(user => {
        user.rooms.push(this._id)
        // DONT THINK WE NEED THE CODE BWLOW...THE USER SHOULD ALREADY HAVE
        // THE ASSIGNMENT AND THE COURSE IN THEIR RESOURCES
        // if (this.course) user.courseNotifications.newRoom.push({notificationType: 'newRoom', _id: this.course})
        // if (this.activity) user.activities.push(this.activity)
        user.save();
        next()
      })
    })
    .catch(err => next(err))
  } else {
    const field = this.modifiedPaths().forEach(field => {
      if (field === 'members') {
        User.findByIdAndUpdate(this.members[this.members.length - 1].user, {
          $addToSet: {rooms: this._id}
        }).then(user => {next()})
        .catch(err => console.log(err))
      }
    })
  }
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

Room.methods.summary = function() {
  // @TODO ONLY RETURN THE ENTRY CODE IF THE CLIENT IS THE OWNER
  obj = {
    entryCode: this.entryCode,
    activity: this.activity,
    name: this.name,
    description: this.description,
    roomType: this.roomType,
    course: this.course,
    creator: this.creator,
    dueDate: this.dueDate,
    members: this.members,
    tabs: this.tabs,
    events: this.events,
    chat: this.chat,
    _id: this._id,
  }
  console.log(obj)
  return (obj)
  // next();
}
module.exports = mongoose.model('Room', Room);
