const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const CourseTemplate = new mongoose.Schema({
  name: {type: String},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  roomTemplates: [{type: ObjectId, ref: 'RoomTemplate'}],
  isPublic: {type: Boolean, default: false},
  // course: {type: ObjectId, ref, 'Course'} //If template is created from a course instance
},{timestamps: true});


CourseTemplate.post('save', doc => {
  User.findById(doc.creator, (err, res) => {
    if (err) {
      return console.log(err)
    }
    res.courseTemplates.push(doc._id)
    res.save()
    // .then(res => console.log('all good'))
    // .catch(err => console.log("ERR: ",err))
  })
})
module.exports = mongoose.model('CourseTemplate', CourseTemplate);
