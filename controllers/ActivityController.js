const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Activity.find(params)
      .then(activities => resolve(activities))
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Activity.findById(id)
      .then(activity => resolve(activity))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      if (body.template) {

      }
      delete body.template;
      delete body.templateIsPublic;
      db.Activity.create(body)
      .then(activity => {
        resolve(activity)})
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Activity.findByIdAndUpdate(id, body)
      .then(activity => resolve(activity))
      .catch(err => reject(err))
    })
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.Activity.findById(id)
      .then(activity => {
        activity.remove()
        resolve(activity)})
      .catch(err => reject(err))
    })
  }

}
