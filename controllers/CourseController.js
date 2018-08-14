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
    // console.log(id, body)
    const updatedFields = Object.keys(body);
    return new Promise((resolve, reject) => {
      console.log('editing course')
      db.Course.findById(id)
      .then(course => {
        // console.log(updatedFields)
        // console.log(body)
        if (updatedFields[0] === 'notifications') {
          // body = {$addToSet: body}
          // console.log(doc.notifications)
          course.notifications.push(body.notifications)
          // console.log(doc.notifications)
        }
        // Results from a grantAccess() on the front end
        if (updatedFields[0] === 'newMember') {
          console.log("body.newMember: ", body.newMember)
          console.log('course.notifications', course.notifications)
          console.log('course.members', course.members)

          course.members.push(body.newMember)
          course.notifications = course.notifications.filter(ntf => {
            console.log('user ids should match: ', ntf.user, body.newMember.user._id)
            console.log(ntf.user !== body.newMember.user._id)
            // DOUBLE == IMPORTANT HERE. WE DONT WANT TO CHECK TYPE
            return (ntf.user != body.newMember.user._id)
          })
          console.log("NOTFICATIONS SHOULD BE EMPTY: ", course.notifications)
          console.log('course.members should have new member: ', course.members)
          // member should be singular MEMBER for clarity
          // // console.log("BODY.MEMBERS", body.members)
          // console.log('body', body)
          // course.members.push({user: {_id: body.members._id, username: body.members.username}, role: body.role})
          // console.log('course.members ', course.members)
          // course.notifications = course.notifications.filter(ntf => {
          //   console.log(ntf.user._id, body.members.user._id)
          //   return (ntf.user._id !== body.members.user._id)
          // })
          // console.log("course noti after granting access", course.notifcations)
          // console.log(members)
        }
        // console.log("DOC ", course)
        course.save();
        course.populate({path: 'members.user', select: 'username'})
        .populate({path: 'notifications.user', select: 'username'})
        .populate('creator', (err, pop) => {
          console.log('course after popo: ', pop)
          resolve(pop)})

        })


      .catch(err => reject(err))
    })
  }
}
