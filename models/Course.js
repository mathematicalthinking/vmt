const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = new mongoose.Schema({
  template: {type: ObjectId, ref: 'CourseTemplate'},
  name: {type: String},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  nextRoom: {type: ObjectId, ref: 'Room'},
  rooms: [{type: ObjectId, ref: 'Room'}],
  isPublic: {type: Boolean, default: false},
  members: [{user: {type: ObjectId, ref: 'User'}, role: {type: String}, _id: false}],
  notifications: [{user: {type: ObjectId, ref: 'User'}, notificationType: {type: String}, _id: false}],
},{timestamps: true});

// Add this message to the room's chat
// @TODO for some reason I can't get $push to work
// ALso we're using the post method here instead of pre because we need
// the doc_id and because that is supplied by mongoose we have to do it after
Course.pre('save', function (next) {
  console.log(this.isNew)
  console.log(this.modifiedPaths())
  
  this.wasNew = this.isNew;
  next();
});

Course.post('save', function (doc) {
  if (this.wasNew) {
    User.findByIdAndUpdate(doc.creator, {$addToSet: {courses: doc._id}})
    .then(res => {
      console.log('all good') // what should we actually do with this response ?
    })
    .catch(err => console.log(err))
  }
  // if ()
})
module.exports = mongoose.model('Course', Course);
