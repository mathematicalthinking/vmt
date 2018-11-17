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
      .populate('courseNotifications.access.user', 'username')
      .populate('roomNotifications.access.user', 'username')
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
    console.log("UPDATING USER: ",id, body)
    let query;
    if (body.notificationType === 'requestAccess' || body.notificationType === 'grantAccess') {
      if (body.resource === 'courses') {
        delete body.resource;
        query = {$addToSet: {'courseNotifications.access': body}}
      } else {
        delete body.resource;
        query = {$addToSet: {'roomNotifications.access': body}}
      }
    }

    return new Promise((resolve, reject) => {
      if (query) body = query;
      db.User.findByIdAndUpdate(id, body, {new: true})
      .then(user => {
        resolve(user)}) // should we just try to pass back the info that chnaged?
      .catch(err => reject(err))
    })
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      db.User.findByIdAndUpdate(id, {$addToSet: body},{new: true})
      .then(res => resolve(res))
      .catch(err => reject(err))
    })
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      let key = Object.keys(body)[0].split('.')[0];
      db.User.findByIdAndUpdate(id, {$pull: body}, {new: true})
      // .populate(key, 'select', user.username)
      .then(res =>{
        resolve({[key]: res[key]})
        })
      .catch(err => reject(err))
    })
  }
}
