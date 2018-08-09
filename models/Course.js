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
    this.wasNew = this.isNew;
    next();
});

Course.post('save', function (doc) {
  if (this.wasNew) {
    User.findById(doc.creator)
    .then(res => {
      console.log(res)
      console.log('found the user!: ', doc)
      res.courses.push(doc._id)
      res.save()
      // .then(res => console.log('all good'))
      // .catch(err => console.log("ERR: ",err))
    })
    .catch(err => console.log(err))
  }
})
module.exports = mongoose.model('Course', Course);
