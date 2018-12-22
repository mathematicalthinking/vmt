const db = require('../models');
const _ = require('lodash');

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      if (params && params.constructor === Array) {
        params = {'_id': {$in: params}}
      }
      db.Course.find(params ? params : {}).sort('-createdAt')
      .populate({path: 'members.user', select: 'username'})
      .then(courses => resolve(courses))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      // .populate('creator')
      // .populate('rooms', 'name ')
      .populate('members.user', 'username')
      // .populate('notifications.user')
      .then(course => resolve(course))
      .catch(err => reject(err))
    });
  },

  post: body => {
    // check if we should make a template from this course
    return new Promise((resolve, reject) => {
      if (body.template) {
        const {name, description, templatePrivacySetting, creator} = body;
        const template = {name, description, privacySetting: templatePrivacySetting, creator,}
        db.CourseTemplate.create(template)
        .then(template => {
          body.template = template._id;
          delete body[templatePrivacySetting]
          db.Course.create(body)
          .then(course => resolve([course, template]))
          .catch(err => reject(err))

        })
        .catch(err => {console.log(err); reject(err)})
      } else {
        delete body.templatePrivacySetting
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

      let members;
      let course;
        db.Course.findByIdAndUpdate(id, {$addToSet: body}, {new: true})
        .populate({path: 'members.user', select: 'username'})
        .then((res) => {
          course = res;
          return db.User.findByIdAndUpdate(body.members.user, {
            $addToSet: {
              courses: id
            }
          })
        })
        .then(() => {
          members = course.members;
          return db.Notification.create({
            resourceType: 'course',
            resourceId: id,
            toUser: body.members.user,
            notificationType: 'grantedAccess',
          })
        })
        .then(() => resolve(members))
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
    let courseToPopulate;
    let userToAdd;

    return new Promise((resolve, reject) => {
      if (body.checkAccess) {
        let { entryCode, userId } = body.checkAccess;

        db.Course.findById(id)
          .then((course) => {
            // @todo SHOULD PROBABLY HASH THIS AND MOVE TO AUTH ROUTE
            userToAdd = userId;
            // throw error if incorrect entry code
            if (course.entryCode !== entryCode) {
              throw ('Incorrect Entry Code');
            }

            // throw error if user is already member of course
            // member.user is type object, userId is string
            if (_.find(course.members, member => member.user.toString() === userId)) {
              throw ('You already have been granted access to this course!');
            }
            // user provided correct code and is not existing member
            course.members.push({ user: userId, role: 'participant' })
            // Send a notification to all teachers of the course

            return course.save();
          })
          .then((updatedCourse) => {
            courseToPopulate = updatedCourse;
            return db.User.findByIdAndUpdate(userToAdd, { $addToSet: { courses: updatedCourse._id } });
          })
          .then(() => {
            let facilitators = courseToPopulate.members.filter(member => member.role === 'facilitator');
            return Promise.all(facilitators.map((facilitator) => {
              return db.Notification.create({
                resourceType: 'course',
                resourceId: courseToPopulate._id,
                notificationType: 'newMember',
                toUser: facilitator.user,
                fromUser: userId,

              });
            }));
          })
          .then(() => {
            return courseToPopulate.populate({ path: 'members.user', select: 'username' }, (err, pop) => {
              if (err) {
                return reject(err);
              }
              return resolve(pop);
            })
          })
          .catch((err) => {
            reject(err);
          })
      } else {
        return db.Course.findById(id)
          .then((course) => {
            for (key in body) {
              course[key] = body[key]
            }
            return course.save();
          })
          .then((updatedCourse) => {
            return updatedCourse.populate({ path: 'members.user', select: 'username' }, (err, pop) => { return resolve(pop) })
          })
          .catch((err) => {
            reject(err);
          });
        }
    });
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
