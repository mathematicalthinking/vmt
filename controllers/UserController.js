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
    return new Promise((resolve, reject) => {
      db.User.findById(id)
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
    let query;
    if (body.notificationType === 'requestAccess' || body.notificationType === 'grantAccess') {
      if (body.resource === 'course') {
        delete body.resource;
        query = {$addToSet: {'courseNotifications.access': body}}
      } else {
        delete body.resource;
        
        query = {$addToSet: {'roomNotifications.access': body}}
      }
    }
    if (body.notificationType === 'newRoom') {

    }
    if (body.removeNotification) {
      const { resource, listType, ntfId } = body.removeNotification;
      query =  {$pull: {[`${resource}Notifications.${listType}`]: {_id: ntfId}}}
    }

    return new Promise((resolve, reject) => {
      db.User.findByIdAndUpdate(id, query || body, {new: true})
      .then(user => resolve(user)) // should we just try to pass back the info that chnaged?
      .catch(err => reject(err))
    })
  }
}
