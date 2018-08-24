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
Assignment.pre('save', function (next) {
  if (this.isNew) {
    User.findByIdAndUpdate(this.creator, {$addToSet: {assignments: this._id}})
    .then(user => {
      return next();
    })
    .catch(err => {
      // 'what do we even do with an error like this...seems like we should abort assignment creation if we cant create all the connections -- how do we do that'
      console.log(err);
    })

    if (this.course) {
      Course.findByIdAndUpdate(this.course, {$addToSet: {assignments: this._id}})
      .catch(err => console.log(err))
    }
  }
})

module.exports = mongoose.model('Assignment', Assignment);
