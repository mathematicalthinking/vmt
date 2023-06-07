const db = require('../models');

module.exports = {
  get: (params) => db.Tab.find(params),

  getById: (id) => db.Tab.findById(id),

  populateByIds: (_ids) => {
    return db.Tab.find({ _id: { $in: _ids } }).populate('events');
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      let newTab;
      db.Tab.create(body)
        .then((tab) => {
          newTab = tab;
          if (tab.room) {
            return db.Room.findByIdAndUpdate(body.room, {
              $addToSet: { tabs: tab._id },
            });
          }
          return db.Activity.findByIdAndUpdate(body.activity, {
            $addToSet: { tabs: tab._id },
          });
        })
        .then(() => {
          resolve(newTab);
        })
        .catch((err) => reject(err));
    });
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      if (body.newVisitor) {
        body = {
          $addToSet: {
            visitors: body.newVisitor,
            visitorsSinceInstructionsUpdated: body.newVisitor,
          },
        };
      } else if (body.instructions) {
        // clear out visitorsSinceInstructionsUpdate
        body.visitorsSinceInstructionsUpdated = [];
      }
      db.Tab.findByIdAndUpdate(id, body)
        .then((tab) => resolve(tab))
        .catch((err) => reject(err));
    });
  },
};
