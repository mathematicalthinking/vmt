const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const User = require('./User');
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
Course.pre('save', function(next){
  if (this.isNew) {
    User.findByIdAndUpdate(this.creator, {$addToSet: {courses: this._id}})
    .then(user => {
      next()
    })
  }
  // IF We're updating
  if (!this.isNew) {
    this.modifiedPaths().forEach(field => {
      if (field === 'rooms') {
        // console.log('updating rooms in course pre save hook')
      // add these rooms to all of the members in this course
      // and add all of the members of this course to the room.

      }
      else if (field === 'members') {
        // @TODO IS it safe to assume it will be at the end...I think so
        // cause we're using push
        const member = this.members[this.members.length - 1]
        // console.log('new member: ', member)
        const promises = [];
        promises.push(User.findByIdAndUpdate(member.user, {
          $addToSet: {courses: this._id, rooms: this.rooms},
          $addToSet: {'courseNotifications.access': {
            notificationType: 'grantedAccess',
            _id: this._id,
          }
          // $addToSet ROOM NOTIFICATIONS
          }
        }))
        promises.push(User.findByIdAndUpdate(this.creator, {
          $pull: {'courseNotifications.access': {user: member.user}}
        })
        .then(user => {
          console.log(user)
          next();
        }))
        Promise.all(promises).then(res => next())
        // add all of the rooms of this course to the new member
        // and add them to the rooms' list of members
        // console.log(this._id)
        // console.log(this.members)
      } else next();
    })
  }
  console.log('next')
});

// Course.post('save', function (doc) {
//
//   // if ()
// })
module.exports = mongoose.model('Course', Course);
