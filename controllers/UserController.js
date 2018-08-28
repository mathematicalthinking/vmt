const db = require('../models')

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.User.find(params)
      .then(users => resolve(users))
      .catch(err => reject(err));
    });
  },

  getById: id => {
    console.log('Getting user ', id, ' info')
    return new Promise((resolve, reject) => {
      db.User.findById(id)
      // .populate({
      //   path: 'rooms',
      //   options: {sort: {createdAt: -1}}
      // })
      .populate('courses')
      .populate('courseTemplates')
      .then(user => resolve(user))
      .catch(err => reject(err))
    });
  },

  post: body => {
    return new Promise((resolve, reject) => {
      db.User.create(body)
      .then(user => resolve(user))
      .catch(err => reject(err))
    })
  },

  put: (id, body) => {
    console.log(id, body.notificationType)
    let query;
    if (body.notificationType === 'requestAccess' || body.notificationType === 'grantAccess') {
      console.log('in here')
      if (body.resource === 'course') {
        console.log('should be in here')
        delete body.resource;
        query = {$addToSet: {'courseNotifications.access': body}}
      } else {
        delete body.resource;
        query = {$addToSet: {'roomNotifications.access': body}}
      }
    }
    if (body.notificationType === 'newRoom') {

    }

    console.log(query)
    return new Promise((resolve, reject) => {
      db.User.findByIdAndUpdate(id, query || body, {new: true})
      .then(user => resolve(user))
      .catch(err => reject(err))
    })
  }
}
