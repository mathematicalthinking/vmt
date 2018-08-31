const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Course = new mongoose.Schema({
  template: {type: ObjectId, ref: 'CourseTemplate'},
  name: {type: String},
  description: {type: String},
  creator: {type: ObjectId, ref: 'User'},
  assignments: [{type: ObjectId, ref: 'Assignment'}],
  rooms: [{type: ObjectId, ref: 'Room'}],
  isPublic: {type: Boolean, default: false},
  members: [{user: {type: ObjectId, ref: 'User'}, role: {type: String}, _id: false}],
},{timestamps: true});

// Not using arrow function so we can have access to THIS docuemnt
// DO WE NEED TO CALL NEXT?
Course.pre('save', async function(){
  const User = require('./User');
  if (this.isNew) {
    await User.findByIdAndUpdate(this.creator, {$addToSet: {courses: this._id}})
  }
  // IF We're updating
  if (!this.isNew) {
    const promises = [];
    this.modifiedPaths().forEach(field => {
      console.log(field)
      if (field === 'rooms') {
        // console.log('updating rooms in course pre save hook')
      // add these rooms to all of the members in this course
      // and add all of the members of this course to the room.

      } else if (field === 'members') {
        const member = this.members[this.members.length - 1]
        promises.push(User.findByIdAndUpdate(member.user, {
          $addToSet: {
            courses: this._id,
            'courseNotifications.access': {
              notificationType: 'grantedAccess',
              _id: this._id,
            },
            assignments: this.assignments,
            rooms: {$each: this.rooms}
          }
        }))
        promises.push(User.findByIdAndUpdate(this.creator, {
          $pull: {'courseNotifications.access': {user: member.user}}
        }))
        // next()
      } else if (field === 'assignments') {

      }
    })
    await Promise.all(promises)
  }
});

Course.pre('remove', async function() {
  const User = require('./User');
  const Room = require('./Room');
  const Assignment = require('./Assignment')
  const promises = [User.update({_id: {$in: this.members.map(member => member.user)}}, {
    $pull: {
      courses: this._id,
      rooms: {$in: this.rooms},
      'roomNotifications.access': {_id: {$in: this.rooms}},
      'roomNotifications.newRoom': {_id: {$in: this.rooms}},
      'courseNotifications.access': {_id: this._id},
      'courseNotifications.newRoom': {_id: {$in: this._id}},
      assignments: {$in: this.assignments}
    }
  }, {multi: true})];
  promises.push(Room.deleteMany({_id: {$in: this.rooms}}));
  promises.push(Assignment.deleteMany({_id: {$in: this.assignments}}));
  await Promise.all(promises);
})

module.exports = mongoose.model('Course', Course);
