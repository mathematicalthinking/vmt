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
        console.log('posting body: ', body)
        db.Course.create(body)
        .then(course => {
          course.populate({path: 'members.user', select: 'username'}, () => resolve(course))
        })
        .catch(err => {console.log(err); reject(err)})
      }
    })
  },

  put: (id, body) => {
    // console.log(id, body)
    const updatedFields = Object.keys(body);
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .then(course => {
        console.log(updatedFields[0])
        if (updatedFields[0] === 'newMember') {
          course.members.push({role: 'Student', user: body.newMember})
        }
        // console.log("DOC ", course)
        course.save(); // @TODO CONSIDER AWAITING THIS SO WE CAN ONLY RESOLVE IF THE SAVE WORKS
        course.populate({path: 'members.user', select: 'username'}, (err, pop) => {resolve(pop)})})
      .catch(err => reject(err))
    })
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.Course.findById(id)
      .then(course => {
        console.log(course)
        course.remove()
        resolve(course)}
      )
      .catch(err => reject(err))
    })
  }
}
