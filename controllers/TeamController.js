const db = require("../models");

module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.Team.find(params)
        .then(teams => resolve(teams))
        .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.Team.findById(id)
        .then(team => resolve(team))
        .catch(err => reject(err));
    });
  },

  post: body => {
    return new Promise((resolve, reject) => {
      db.Team.create(body)
        .then(team => resolve(team))
        .catch(err => reject(err));
    });
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Team.findByIdAndUpdate(id, body)
        .then(team => resolve(team))
        .catch(err => reject(err));
    });
  }
};
