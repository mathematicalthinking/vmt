const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
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
  members: [{user: {type: ObjectId, ref: 'User'}, role: {type: String}, _id: false}],
  currentUsers: {type: [{type: ObjectId, ref: 'User'}], default: []},
  tabs: [{
    ggbFile: {type: String,},
    desmosLink: {type: String,},
    _id: false,
  }],
  notifications: [{user: {type: ObjectId, ref: 'User'}, notificationType: {type: String}, _id: false}],
  isPublic: {type: Boolean, default: false}
},
{timestamps: true});

Room.pre('save', function (next) {
  // ON CREATION UPDATE THE CONNECTED MODELS
  if (this.isNew) {
    User.findByIdAndUpdate(this.creator, {$addToSet: {assignments: this._id}})
    .then(user => {
      return next();
    })
    .catch(err => {
      return console.log(err)
    })
    if (this.course) {
      Course.findByIdAndUpdate(this.course, {$addToSet: {assignments: this._id}})
      .then(course => {
        if (course.members) {
          User.update({_id: {$in: course.members}}, {$addToSet: {rooms: this._id}}, {'multi': true})
          .then(users => { return next()})
          .catch(err => {console.log(err)})
        } else return next();
      })
      .catch(err => console.log(err))
    }
  }
  next();
});
Room.post('save', function(doc) { // intentionally not using arrow functions so 'this' refers to the model
  // If this is a post request hook

})

module.exports = mongoose.model('Room', Room);
