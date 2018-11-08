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
  roomType: {type: String, enum: ['geogebra', 'desmos']},
  course: {type: ObjectId, ref: 'Course'},
  creator: {type: ObjectId, ref: 'User'},
  dueDate: {type: Date,},
  chat: {type: [{type: ObjectId, ref: 'Message'}], default: []},
  members: [{
    user: {type: ObjectId, ref: 'User'},
    role: {type: String},
    _id: false}],
  currentUsers: {type: [{user: {type: ObjectId, ref: 'User'}, socket: {type: String}}], default: []},
  currentState: {type: String},
  ggbFile: {type: String,},
  desmosLink: {type: String,},
  events: {type: [{type: ObjectId, ref: 'Event', _id: false}], default: []},
  isPublic: {type: Boolean, default: false},
  tempRoom: {type: Boolean, default: false},
  image: {type: String,},
  instructions: {type: String,}
},
{timestamps: true});

Room.pre('save', function (next) {
  // ON CREATION UPDATE THE CONNECTED MODELS
  if (this.isNew & !this.tempRoom) {
    let promises = [];
    promises.push(User.findByIdAndUpdate(this.creator, {$addToSet: {rooms: this._id}, accountType: 'facilitator'}))
    if (this.course) {
      promises.push(Course.findByIdAndUpdate(this.course, {$addToSet: {rooms: this._id},}))
    }
    if (this.activity) {
      promises.push(Activity.findByIdAndUpdate(this.activity, {$addToSet: {rooms: this._id}}))
    }
    Promise.all(promises)
    .then(values => {
      // values[0].forEach(user => {
      //   console.log('user!: ', user)
      //   user.rooms.push(this._id)
      //   user
      //   // DONT THINK WE NEED THE CODE BWLOW...THE USER SHOULD ALREADY HAVE
      //   // THE ACTIVITY AND THE COURSE IN THEIR RESOURCES
      //   // if (this.course) user.courseNotifications.newRoom.push({notificationType: 'newRoom', _id: this.course})
      //   // if (this.activity) user.activities.push(this.activity)
      //   user.save();
        next()
      // })
    })
    .catch(err => next(err))
  } else if (!this.isNew) {
    let field = this.modifiedPaths().forEach(field => {
      if (field === 'members') {
        User.findByIdAndUpdate(this.members[this.members.length - 1].user, {
          $addToSet: {rooms: this._id}
        }).then(user => {next()})
        .catch(err => console.log(err))
      }
    })
  }
  else {
    next()
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
    image: this.image,
    _id: this._id,
  }
  return (obj)
  // next();
}
module.exports = mongoose.model('Room', Room);
