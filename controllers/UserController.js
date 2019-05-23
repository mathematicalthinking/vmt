const db = require('../models');
const ObjectId = require('mongoose').Types.ObjectId;
module.exports = {
  get: params => {
    return new Promise((resolve, reject) => {
      db.User.find(params)
        .then(users => resolve(users))
        .catch(err => reject(err));
    });
  },

  search: (regex, exclude) => {
    let idsToExclude = exclude.map(id => ObjectId(id));
    return new Promise((resolve, reject) => {
      db.User.find({
        $or: [{ email: regex }, { username: regex }],
        _id: { $nin: idsToExclude },
      })
        .limit(5)
        .select('username email')
        .then(users => {
          resolve(users);
        })
        .catch(err => reject(err));
    });
  },

  getById: id => {
    return new Promise((resolve, reject) => {
      db.User.findById(id)
        .populate({
          path: 'courses',
          populate: { path: 'members.user', select: 'username' },
        })
        .populate({
          path: 'rooms',
          select: '-currentState',
          populate: { path: 'tabs members.user', select: 'username tabType' },
        })
        .populate({
          path: 'activities',
          populate: { path: 'tabs' },
        })
        .populate({ path: 'notifications', populate: { path: 'fromUser' } })
        .then(user => resolve(user))
        .catch(err => reject(err));
    });
  },
  /**
   * @param  {String} username
   * @param {String} resourceName
   * @param {String} recourses
   */
  getUserResources: (token, { resources, resourceName }) => {
    return db.User.findOne(
      { token, tokenExpiryDate: { $gt: Date.now() } },
      { select: resources }
    )
      .populate({
        path: 'activities',
        select: 'name members intructions image rooms',
        populate: {
          path: 'members.user',
          select: 'username',
        },
        populate: {
          path: 'rooms',
          populate: {
            path: 'members.user',
            select: 'username',
          },
        },
      })
      .populate({
        path: 'rooms',
        select: 'name members image instructions activity ',
        populate: [
          {
            path: 'members.user',
            select: 'username',
          },
          { path: 'activity', select: 'name instructions' },
        ],
      })
      .then(result => {
        let filteredResults = {};
        if (!result) {
          filteredResults.isInvalidToken = true;
          return filteredResults;
        }
        resources.split(' ').forEach(resource => {
          // resourceName = resourceName.replace(/\s+/g, "");
          let regex = new RegExp(resourceName, 'i');
          if (result[resource]) {
            filteredResults[resource] = result[resource].filter(rec => {
              return rec.name.match(regex);
            });
          }
        });
        return filteredResults;
      });
  },

  post: body => {
    return new Promise((resolve, reject) => {
      db.User.create(body)
        .then(user => resolve(user))
        .catch(err => reject(err));
    });
  },

  put: (id, body) => {
    let query;
    // if (body.notificationType === 'requestAccess' || body.notificationType === 'grantAccess') {
    //   if (body.resource === 'courses') {
    //     delete body.resource;
    //     query = {$addToSet: {'courseNotifications.access': body}}
    //   } else {
    //     delete body.resource;
    //     query = {$addToSet: {'roomNotifications.access': body}}
    //   }
    // }

    return new Promise((resolve, reject) => {
      if (query) body = query;
      db.User.findByIdAndUpdate(id, body, { new: true })
        .then(user => {
          resolve(user);
        }) // should we just try to pass back the info that chnaged?
        .catch(err => reject(err));
    });
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      db.User.findByIdAndUpdate(id, { $addToSet: body }, { new: true })
        .then(res => resolve(res))
        .catch(err => reject(err));
    });
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      let key = Object.keys(body)[0].split('.')[0];
      db.User.findByIdAndUpdate(id, { $pull: body }, { new: true })
        // .populate(key, 'select', user.username)
        .then(res => {
          resolve({ [key]: res[key] });
        })
        .catch(err => reject(err));
    });
  },
};
