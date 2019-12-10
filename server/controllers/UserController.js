const { ObjectId } = require('mongoose').Types;
const moment = require('moment');
const db = require('../models');
const { areObjectIdsEqual } = require('../middleware/utils/helpers');

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.User.find(params)
        .then((users) => {
          resolve(users);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  search: (regex, exclude) => {
    const idsToExclude = exclude.map((id) => ObjectId(id));
    return new Promise((resolve, reject) => {
      db.User.find({
        $or: [{ email: regex }, { username: regex }],
        _id: { $nin: idsToExclude },
      })
        .limit(5)
        .select('username email')
        .then((users) => {
          resolve(users);
        })
        .catch((err) => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.User.findById(id)
        .populate({
          path: 'courses',
          populate: { path: 'members.user', select: 'username' },
        })
        .populate({
          path: 'rooms',
          select: '-currentState',
          populate: {
            path: 'tabs members.user',
            select: 'username tabType name instructions',
          },
        })
        .populate({
          path: 'activities',
          populate: { path: 'tabs' },
        })
        .populate({ path: 'notifications', populate: { path: 'fromUser' } })
        .then((user) => resolve(user))
        .catch((err) => reject(err));
    });
  },
  /**
   * @param  {String} username
   * @param {String} resourceName
   * @param {String} recourses
   */
  getUserResources: (id, { resources, resourceName }) => {
    return db.User.findOne({ _id: id }, { select: resources })
      .populate({
        path: 'activities',
        select: 'name members intructions image rooms',
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
      .then((result) => {
        const filteredResults = {};
        if (!result) {
          filteredResults.isInvalidToken = true;
          return filteredResults;
        }
        resources.split(' ').forEach((resource) => {
          // resourceName = resourceName.replace(/\s+/g, "");
          const regex = new RegExp(resourceName, 'i');
          if (result[resource]) {
            filteredResults[resource] = result[resource].filter((rec) => {
              return rec.name.match(regex);
            });
          }
        });
        return filteredResults;
      });
  },

  post: (body) => {
    return new Promise((resolve, reject) => {
      db.User.create(body)
        .then((user) => resolve(user))
        .catch((err) => reject(err));
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
        .then((user) => {
          resolve(user);
        }) // should we just try to pass back the info that chnaged?
        .catch((err) => reject(err));
    });
  },

  add: (id, body) => {
    return new Promise((resolve, reject) => {
      db.User.findByIdAndUpdate(id, { $addToSet: body }, { new: true })
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      const key = Object.keys(body)[0].split('.')[0];
      db.User.findByIdAndUpdate(id, { $pull: body }, { new: true })
        // .populate(key, 'select', user.username)
        .then((res) => {
          resolve({ [key]: res[key] });
        })
        .catch((err) => reject(err));
    });
  },
  getRecentActivity: async (criteria, skip, filters) => {
    let { since, to } = filters;

    const allowedSincePresets = ['day', 'week', 'month', 'year'];

    if (allowedSincePresets.includes(since)) {
      since = Number(
        moment()
          .subtract(1, since)
          .startOf('day')
          .format('x')
      );
    } else {
      // default to activity in last day
      let momentObj = moment(since, 'x', true);
      if (!momentObj.isValid()) {
        momentObj = moment();
      }
      since = Number(momentObj.startOf('day').format('x'));
    }
    const initialFilter = { updatedAt: { $gte: new Date(since) } };

    if (to && since && to > since) {
      let toMomentObj = moment(to, 'x', true);
      if (!toMomentObj.isValid()) {
        toMomentObj = moment();
      }

      to = Number(toMomentObj.endOf('day').format('x'));
      initialFilter.updatedAt.$lte = new Date(to);
    }

    const skipInt = skip ? parseInt(skip, 10) : 0;

    const [users, totalCount] = await Promise.all([
      db.User.find(initialFilter, {
        username: 1,
        latestIpAddress: 1,
        updatedAt: 1,
        isSuspended: 1,
        socketId: 1,
        doForceLogout: 1,
        accountType: 1,
      })
        .sort({ updatedAt: -1 })
        .skip(skipInt)
        .limit(20)
        .lean()
        .exec(),
      db.User.count(initialFilter).exec(),
    ]);

    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const filter = {
          user: user._id,
          timestamp: { $gte: since },
        };

        if (to && since && to > since) {
          filter.timestamp.$lte = to;
        }
        const [events, messages] = await Promise.all([
          db.Event.find(filter, { room: 1 })
            .lean()
            .populate({ path: 'room', select: 'name' })
            .exec(),
          db.Message.find(filter, { room: 1 })
            .lean()
            .populate({ path: 'room', select: 'name' })
            .exec(),
        ]);
        user.eventsCount = events.length;
        user.messagesCount = messages.length;

        user.activeRooms = [];
        events.forEach((event) => {
          if (
            event.room &&
            !user.activeRooms.find((room) => {
              return areObjectIdsEqual(room._id, event.room._id);
            })
          ) {
            user.activeRooms.push(event.room);
          }
        });
        messages.forEach((message) => {
          if (
            message.room &&
            !user.activeRooms.find((room) => {
              return areObjectIdsEqual(room._id, message.room._id);
            })
          ) {
            user.activeRooms.push(message.room);
          }
        });
        return user;
      })
    );

    return [usersWithStats, { totalCount }];
  },
};
