const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Assignment.find(params)
      .then(assignments => resolve(assignments))
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Assignment.findById(id)
      .then(assignment => resolve(assignment))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      if (body.template) {

      }
      delete body.template;
      delete body.templateIsPublic;
      db.Assignment.create(body)
      .then(assignment => {
        resolve(assignment)})
      .catch(err => {
        console.log(err)
        reject(err)
      })
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Assignment.findByIdAndUpdate(id, body)
      .then(assignment => resolve(assignment))
      .catch(err => reject(err))
    })
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.Assignment.findById(id)
      .then(assignment => {
        assignment.remove()
        resolve(assignment)})
      .catch(err => reject(err))
    })
  }

}
