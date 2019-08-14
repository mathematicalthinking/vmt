const db = require('../models');

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.CourseTemplate.find(params)
        .sort('-createdAt')
        .then((courseTemplates) => resolve(courseTemplates))
        .catch((err) => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.CourseTemplate.findById(id)
        .populate({ path: 'creator' })
        .populate({ path: 'events' })
        .populate({ path: 'chat', populate: { path: 'user' } })
        .then((courseTemplate) => {
          resolve(courseTemplate);
        })
        .catch((err) => reject(err));
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.CourseTemplate.create(body)
        .then((courseTemplate) => resolve(courseTemplate))
        .catch((err) => reject(err));
    });
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.CourseTemplate.findByIdAndUpdate(id, body)
        .then((courseTemplate) => resolve(courseTemplate))
        .catch((err) => reject(err));
    });
  },
};
