const db = require('../models');
const Promise = require('bluebird');
module.exports = {
  get: () => {
    return new Promise((resolve, reject) => {
      console.log("Request for messages hit the backend")
      db.Message.find({}).populate('user')
      .then(messages => {
        console.log("Mesg: ", messages)
        resolve(messages)
      })
      .catch(err => {
        console.log("ERR: ", err);
        reject(err);
      });
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Message.findById(id)
      .then(message => {
        resolve(message);
      })
      .catch(err => {
        reject(err);
      });
    });
  },

  post: (params) => {
    return new Promise((resolve, reject) => {
      db.Message.create({text: params.message, user: params.user})
      .then(message => {
        resolve(message)
      })
      .catch((err) => {
        reject(err)
      })
    })
  },

  update: (id, params) => {
    return new Promise((resolve, reject) => {
      db.Message.findByIdAndUpdate(id, params)
      .then(message => {
        resolve(message);
      })
      .catch(err => {
        reject(err);
      })
    });
  },

  remove: (id) => {
    return new Promise((resolve, reject) => {
      db.Message.findByIdAndDelete(id)
      .then(message => {
        resolve(message);
      })
      .catch(err => {
        reject(err);
      })
    })
  }
}
