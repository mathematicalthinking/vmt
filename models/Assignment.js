const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Assignment = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  course: {type: ObjectId, ref: 'Course'},
  dueDate: {type: Date,},
  roomType: {type: String, default: 'geogebra'},
  creator: {type: ObjectId, ref: 'User'},
  rooms: {type: [{type: ObjectId, ref: 'Room'}], default: [], _id: false},
  tabs: [{
    ggbFile: {type: String},
    desmosLink: {type: String},
    _id: false,
    events: [{type: String}]
  }],
  template: {type: ObjectId, ref: 'AssignmentTemplate'},
}, {timestamps: true});

// STOP CHANGING THIS FUNCTION BELOW TO AN ARROW FUNCTION!!!
// WE NEED 'THIS' TO REFER TO THE FUNCTIONS CONTEXT
Assignment.pre('save', async function() {
  const promises = []
  if (this.isNew) {
    promises.push(User.findByIdAndUpdate(this.creator, {$addToSet: {assignments: this._id}}))
    if (this.course) {
      promises.push(Course.findByIdAndUpdate(this.course, {$addToSet: {assignments: this._id}}))
    }
  }
  await Promise.all(promises)
})

Assignment.pre('remove', async function() {
  const promises = [];
  promises.push(User.findByIdAndUpdate(this.creator, {$pull: {assignments: this._id}}))
  if (this.course) {
    promises.push(Course.findByIdAndUpdate(this.course, {$pull: {assignments: this._id}}))
  }
  await Promise.all(promises);
})

module.exports = mongoose.model('Assignment', Assignment);
