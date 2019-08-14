const db = require('../models');

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.RoomTemplate.find(params)
        .sort('-createdAt')
        .then((roomTemplates) => resolve(roomTemplates))
        .catch((err) => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.RoomTemplate.findById(id)
        .populate({ path: 'creator' })
        .populate({ path: 'events' })
        .populate({ path: 'chat', populate: { path: 'user' } })
        .populate({ path: 'currentMembers' })
        .then((roomTemplate) => {
          resolve(roomTemplate);
        })
        .catch((err) => reject(err));
    });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.RoomTemplate.create(body)
        .then((roomTemplate) => resolve(roomTemplate))
        .catch((err) => reject(err));
    });
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.RoomTemplate.findByIdAndUpdate(id, body)
        .then((roomTemplate) => resolve(roomTemplate))
        .catch((err) => reject(err));
    });
  },
};
