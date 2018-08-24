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
      console.log('VALUES: ', values)
      values[0].forEach(user => {
        console.log("user: ", user)
        user.rooms.push(this._id)
        user.save();
        next()
      })
    })
    .catch(err => console.log(err))
  }
  next();
});
Room.post('save', function(doc) { // intentionally not using arrow functions so 'this' refers to the model
  // If this is a post request hook

})

module.exports = mongoose.model('Room', Room);
