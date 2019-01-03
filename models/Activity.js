const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
const Course = require('./Course');
const Activity = new mongoose.Schema({
  name: {type: String, required: true},
  description: {type: String},
  course: {type: ObjectId, ref: 'Course'},
  courses: {type: [{type: ObjectId, ref: 'Course'}], default: [], _id: false},
  users: {type: [{type: ObjectId, ref: 'User'}], default: [], _id: false}, // WHAT IS THIS FIELD FOR? maybe people who can edit???
  dueDate: {type: Date,},
  roomType: {type: String, default: 'geogebra'},
  privacySetting: {type: String, enum: ['private', 'public'], default: 'private'},
  creator: {type: ObjectId, ref: 'User'},
  rooms: {type: [{type: ObjectId, ref: 'Room'}], default: [], _id: false},
  ggbFile: {type: String},
  desmosLink: {type: String},
  events: [{type: String}],
  image: {type:String,},
  instructions: {type: String,},
  graphImage: {type: ObjectId, ref: 'Image'},
  tabs: {type: [{type: ObjectId, ref: 'Tab'}], default: [], _id: false},
  source: {type: ObjectId, ref: 'Activity'}, // If this was created from another activity
  // template: {type: ObjectId, ref: 'ActivityTemplate'},
  isTrashed: { type: Boolean, default: false },
}, {timestamps: true});

// STOP CHANGING THIS FUNCTION BELOW TO AN ARROW FUNCTION!!!
// WE NEED 'THIS' TO REFER TO THE FUNCTIONS CONTEXT
Activity.pre('save', async function(next) {
  const promises = []
  if (this.isNew) {
    promises.push(User.findByIdAndUpdate(this.creator, {$addToSet: {activities: this._id}, accountType: 'facilitator'}))
    if (this.course) {
      promises.push(Course.findByIdAndUpdate(this.course, {$addToSet: {activities: this._id}}))
    }
  } else {
    this.modifiedPaths().forEach(field => {
      if (field === 'isTrashed') {
        promises.push(User.findByIdAndUpdate(this.creator, {$pull: {activities: this._id}}))
      }
    })
  }
  try {
    let results = await Promise.all(promises)
    next()
  } catch(err) {console.log(err)}
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
