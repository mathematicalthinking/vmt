const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Assignment = new mongoose.Schema({
  course: {type: ObjectId, ref: 'Course'},
  dueDate: {type: Date,},
  description: {type: String},
  roomType: {type: String, default: 'geogebra'},
  creator: {type: ObjectId, ref: 'User'},
  rooms: [{type: ObjectId, ref: 'Room'}],
  tabs: [{ggbFile: {type: String}, desmosLink: {type: String}}],
  template: {type: ObjectId, ref: 'AssignmentTemplate'},
}, {timestamps: true});

module.exports = mongoose.model('Assignment', Assignment);
