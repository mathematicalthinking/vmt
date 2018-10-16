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

  put: (id, body) => {
    let promises = [];
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .then(course => {
        // When a user is granted access by the owner
        if (body.newMember) {
          course.members.push({role: 'student', user: body.newMember})
          db.User.findByIdAndUpdate(body.newMember, {
            $addToSet: {
              courses: course._id,
              'courseNotifications.access': {
                notificationType: 'grantedAccess',
                _id: course._id,
              },
              // @TODO USER SHOULD HAVE ALL OF THE ROOMS OF THIS COURSE COPIED TO THEIR LIST OF COURSES
              // activities: {$addToSet: {$each: course.activities}},
              // rooms: {$addToSet: {$each: course.rooms}}
            }
          }).then(user => console.log("succesfully added course to users list"))
        } else if (body.checkAccess) {
          let { entryCode, userId } = body.checkAccess;
          // @todo SHOULD PROBABLY HASH THIS
          // When a user gains access with an entry code
          if (course.entryCode === entryCode) {
            course.members.push({user: userId, role: 'student'})
            // Send a notification to the room owner
            promises = course.members.filter(member => member.role === 'teacher').map(teacher => {
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
        }
        Promise.all(promises)
        .then(res => {
          course.save(); // @TODO CONSIDER AWAITING THIS SO WE CAN ONLY RESOLVE IF THE SAVE WORKS
          course.populate({path: 'members.user', select: 'username'}, (err, pop) => {resolve(pop)})})
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
