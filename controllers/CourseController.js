const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.Course.find(params).sort('-createdAt')
      .populate({path: 'members.user', select: 'username'})
      .then(courses => resolve(courses))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .populate('creator')
      .populate('rooms')
      .populate('members.user')
      .populate('notifications.user')
      .then(course => resolve(course))
      .catch(err => reject(err))
    });
  },

  post: body => {
    // check if we should make a template from this course
    return new Promise((resolve, reject) => {
      if (body.template) {
        const {name, description, templateIsPublic, creator} = body;
        const template = {name, description, isPublic: templateIsPublic, creator,}
        db.CourseTemplate.create(template)
        .then(template => {
          body.template = template._id;
          delete body[templateIsPublic]
          db.Course.create(body)
          .then(course => resolve([course, template]))
          .catch(err => reject(err))

        })
        .catch(err => {console.log(err); reject(err)})
      } else {
        delete body.templateIsPublic
        delete body.template;
        db.Course.create(body)
        .then(course => {
          course.populate({path: 'members.user', select: 'username'}, () => resolve(course))
        })
        .catch(err => {console.log(err); reject(err)})
      }
    })
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      // Send a notification to user that they've been granted access to a new course
      db.User.findByIdAndUpdate(body.members.user, {
        $addToSet: {
          courses: id,
          'courseNotifications.access': {
            notificationType: 'grantedAccess',
            _id: id,
          }
        }
      }, {new: true})
      .then(res => {})
      db.Course.findByIdAndUpdate(id, {$addToSet: body}, {new: true})
      .populate({path: 'members.user', select: 'username'})
      .then(res => {
        resolve(res.members)})
      .catch(err => reject(err))
    })
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      // Remove this course from the user's list of courses
      db.User.findByIdAndUpdate(body.members.user, {$pull: {courses: id}})
      db.Course.findByIdAndUpdate(id, {$pull: body}, {new: true})
      .populate({path: 'members.user', select: 'username'})
      .then(res => resolve(res.members))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    let promises = [];
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .then(course => {
        if (body.checkAccess) {
          let { entryCode, userId } = body.checkAccess;
          // @todo SHOULD PROBABLY HASH THIS AND MOVE TO AUTH ROUTE
          // When a user gains access with an entry code
          if (course.entryCode === entryCode) {
            course.members.push({user: userId, role: 'participant'})
            // Send a notification to all teachers of the room
            promises = course.members.filter(member => member.role === 'facilitator').map(facilitator => {
              return db.User.findByIdAndUpdate(course.creator, {
                $addToSet: {
                  'courseNotifications.access': {
                    notificationType: 'newMember', _id: course._id, user: userId 
                  }
                }
              }, {new: true})
            })
            db.User.findByIdAndUpdate(userId, {
              $addToSet: {courses: id,}
            }).then(res => console.log(id, ", added to ", userId, "'s list of courses"))
          } else reject({errorMessage: 'incorrect entry code'})
        } else {
          for (key in body) {
            course[key] = body[key]
          }
        }
        Promise.all(promises)
        .then(res => {
          course.save().then((c) => {
            c.populate({path: 'members.user', select: 'username'}, (err, pop) => {resolve(pop)})
          })
        })
      })
      .catch(err => reject(err))
    })
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .then(course => {
        course.remove()
        resolve(course)}
      )
      .catch(err => reject(err))
    })
  }
}
