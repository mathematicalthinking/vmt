const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.Course.find(params).sort('-createdAt')
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
        console.log('posting body: ', body)
        db.Course.create(body)
        .then(course => resolve(course))
        .catch(err => {console.log(err); reject(err)})
      }
    })
  },

  put: (id, body) => {
    console.log(id, body)
    const updatedField = Object.keys(body)
    if (updatedField[0] === 'notifications') {
      body = {$addToSet: body}
    }
    if (updatedField[0] === 'members') {
      console.log('adding to user')
      console.log(body.members.user)
      // also...add this course to the user model of the user who signed up
      db.User.findByIdAndUpdate(body.members.user, {$addToSet: {courses: id}}, {new: true})
      .then(res => {
        console.log("res: ,", res)
      })
      .catch(err => {
        console.log(err)
      })
      body = {$addToSet: body, $pull: {notifications: {user: body.members.user}}}
    }
    return new Promise((resolve, reject) => {
      console.log('editing course')
      db.Course.findByIdAndUpdate(id, body, {new: true})
      .populate('creator')
      .populate('rooms')
      .populate('members.user')
      .populate('notifications.user')
      .then(course => {
        console.log(course)
        resolve(course)})
      .catch(err => reject(err))
    })
  }
}
