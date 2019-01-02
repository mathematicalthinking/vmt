const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const CourseTemplate = new mongoose.Schema({
  name: {type: String},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  roomTemplates: [{type: ObjectId, ref: 'RoomTemplate'}],
  privacySetting: {type: String, enum: ['private', 'public'], default: 'private'},
  // course: {type: ObjectId, ref, 'Course'} //If template is created from a course instance
  isTrashed: { type: Boolean, default: false },
},{timestamps: true});


CourseTemplate.post('save', doc => {
  User.findById(doc.creator, (err, res) => {
    if (err) {
      return console.log(err)
    }
    res.courseTemplates.push(doc._id)
    res.save()
  })
})
module.exports = mongoose.model('CourseTemplate', CourseTemplate);
