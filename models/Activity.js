const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Activity = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  course: {type: ObjectId, ref: 'Course'},
  courses: {type: [{type: ObjectId, ref: 'Course'}], default: [], _id: false},
  users: {type: [{type: ObjectId, ref: 'User'}], default: [], _id: false},
  dueDate: {type: Date,},
  roomType: {type: String, default: 'geogebra'},
  creator: {type: ObjectId, ref: 'User'},
  rooms: {type: [{type: ObjectId, ref: 'Room'}], default: [], _id: false},
  ggbFile: {type: String},
  desmosLink: {type: String},
  events: [{type: String}],
  image: {type:String,},
  instructions: {type: String,}
  // template: {type: ObjectId, ref: 'ActivityTemplate'},
}, {timestamps: true});

// STOP CHANGING THIS FUNCTION BELOW TO AN ARROW FUNCTION!!!
// WE NEED 'THIS' TO REFER TO THE FUNCTIONS CONTEXT
Activity.pre('save', async function() {
  const promises = []
  if (this.isNew) {
    promises.push(User.findByIdAndUpdate(this.creator, {$addToSet: {activities: this._id}, accountType: 'facilitator'}))
    if (this.course) {
      promises.push(Course.findByIdAndUpdate(this.course, {$addToSet: {activities: this._id}}))
    }
  }
  await Promise.all(promises)
})

Activity.pre('remove', async function() {
  const promises = [];
  promises.push(User.findByIdAndUpdate(this.creator, {$pull: {activities: this._id}}))
  if (this.course) {
    promises.push(Course.findByIdAndUpdate(this.course, {$pull: {activities: this._id}}))
  }
  await Promise.all(promises);
})

module.exports = mongoose.model('Activity', Activity);
