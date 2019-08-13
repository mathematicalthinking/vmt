const _ = require('lodash');
const db = require('../models');

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Notification.find(params)
        .then((notifications) => resolve(notifications))
        .catch((err) => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Notification.findById(id)
        .then((notification) => resolve(notification))
        .catch((err) => reject(err));
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.Notification.create(body)
        .then((notification) => resolve(notification))
        .catch((err) => reject(err));
    });
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Notification.findById(id)
        .exec()
        .then((notification) => {
          if (_.isNil(notification)) {
            return reject(); // when whould this happen??
          }
          Object.keys(body).forEach((key) => {
            notification[key] = body[key];
          });
          return resolve(notification.save());
        })
        .catch((err) => reject(err));
    });
  },
};
