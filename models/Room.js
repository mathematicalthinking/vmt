const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Image = require('./Image');
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
  currentMembers: {type: [{user: {type: ObjectId, ref: 'User'}, socket: {type: String},  _id: false}], default: []},
  currentState: {type: String},
  ggbFile: {type: String,},
  desmosLink: {type: String,},
  events: {type: [{type: ObjectId, ref: 'Event', _id: false}], default: []},
  isPublic: {type: Boolean, default: false},
  tempRoom: {type: Boolean, default: false},
  image: {type: String,},
  instructions: {type: String,},
  graphImage: {type: ObjectId, ref: 'Image'}
},
{timestamps: true});

Room.pre('save', function (next) {
  console.log("EDITITD: ", this)
  if (this.isNew & !this.tempRoom) {
    let promises = [];
    promises.push(Image.create({imageData: ''}))
    promises.push(User.findByIdAndUpdate(this.creator, {$addToSet: {rooms: this._id}, accountType: 'facilitator'}))
    if (this.course) {
      promises.push(Course.findByIdAndUpdate(this.course, {$addToSet: {rooms: this._id},}))
    }
    if (this.activity) {
      promises.push(Activity.findByIdAndUpdate(this.activity, {$addToSet: {rooms: this._id}}))
    }
    Promise.all(promises)
    .then(values => {
      this.graphImage = values[0]._id;
      next()
    })
    .catch(err => next(err))
  } else if (!this.isNew) {
    // console.log(this.modifiedPaths())
    this.modifiedPaths().forEach(field => {
      if (field === 'members') { 
        User.findByIdAndUpdate(this.members[this.members.length - 1].user, {
          $addToSet: {rooms: this._id}
        }).then(user => {next()})
        .catch(err => console.log(err))
      } else if (field === 'tempRoom') {
        User.findByIdAndUpdate(this.creator, {$addToSet: {rooms: this._id}})
        .then(res => {
          console.log(":RES: ", res)
          next()
        })
        .catch(console.log(err))
      }
    })
  }
  else {
    console.log('ar we gheying here')
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
