const { ObjectId } = require('mongoose').Types;
const moment = require('moment');
const db = require('../models');
const { areObjectIdsEqual } = require('../middleware/utils/helpers');
const STATUS = require('../constants/status');

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
        .sort([['updatedAt', -1]])
        .select('username email accountType')
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
            select: 'username tabType desmosLink name instructions',
          },
        })
        .populate({
          path: 'activities',
          populate: { path: 'tabs', select: 'name tabType desmosLink' },
        })
        .populate({
          path: 'notifications',
          populate: { path: 'fromUser', select: '_id username' },
        })
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
        select: 'name members instructions image rooms', // do activities have members?
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
    return new Promise((resolve, reject) => {
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
    let initialFilter = {
      updatedAt: { $gte: new Date(since) },
      isTrashed: false,
      status: { $nin: [STATUS.ARCHIVED, STATUS.TRASHED] },
    };

    if (to && since && to > since) {
      let toMomentObj = moment(to, 'x', true);
      if (!toMomentObj.isValid()) {
        toMomentObj = moment();
      }

      to = Number(toMomentObj.endOf('day').format('x'));
      initialFilter.updatedAt.$lte = new Date(to);
    }

    const skipInt = skip ? parseInt(skip, 10) : 0;

    if (criteria) {
      initialFilter = {
        ...initialFilter,
        $or: [
          { firstName: criteria },
          { lastName: criteria },
          { username: criteria },
          { accountType: criteria },
          { latestIpAddress: criteria },
          { email: criteria },
        ],
      };
    }

    const [users, totalCount] = await Promise.all([
      db.User.find(initialFilter, {
        username: 1,
        latestIpAddress: 1,
        updatedAt: 1,
        isSuspended: 1,
        socketId: 1,
        doForceLogout: 1,
        accountType: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
      })
        .sort({ updatedAt: -1 })
        .skip(skipInt)
        .limit(20)
        .lean()
        .exec(),
      db.User.countDocuments(initialFilter).exec(),
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

  addArchivedRooms: (userId, archivedRoomIds) => {
    return db.User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { 'archive.rooms': { $each: [...archivedRoomIds] } } }
    );
  },

  // @PARAM: users is an array of objects in the form { _id, username }
  // @RETURN: a promise that resolves to the result of the bulkWrite operation of updating the usernames
  updateUsernames: (users) => {
    // first filter by users that have a username
    const usersWithUsernames = users.filter((user) => user.username);
    return new Promise((resolve, reject) => {
      db.User.bulkWrite(
        usersWithUsernames.map((user) =>
          // if user.isAdmin is true, then we don't want to update it
          // because we don't want to update admin usernames
          ({
            updateOne: {
              filter: { _id: user._id, isAdmin: false },
              update: { username: user.username },
            },
          })
        )
      )
        .then((res) => {
          resolve(res);
        })
        .catch((err) => reject(err));
    });
  },

  // Returns a list of users based on resource type and resource id
  // @PARAM: resourceType is a string that is either 'activities', 'courses', or 'rooms'
  // @PARAM: resourceId is a string that is the id of the resource
  // @PARAM: [fields=[]] is an array of strings that are the fields to populate.
  // fields? return a list of users populated with the fields specified. If not fields, return a list of users with no fields populated.
  // RETURNS: a promise that resolves to a list of users.
  getUsersByResource: async (resourceType, resourceId, fields = []) => {
    try {
      // get a list of users for the resource at the given id
      let users;
      if (resourceType === 'courses' || resourceType === 'rooms') {
        // remove the 's' from the resourceType & capitalize the first letter
        const type =
          resourceType
            .slice(0, -1)
            .charAt(0)
            .toUpperCase() + resourceType.slice(0, -1).slice(1);

        const dbUsers = await db[type].find({ _id: resourceId }, 'members');
        users = dbUsers[0].members.map((member) => member.user);
      } else {
        // activities has a different schema
        // it contains a "users" array: facilitators of the activity
        // and a "rooms" array: rooms that contain the activity
        // we want to get the users from each of the rooms
        // to do that we need to get the rooms first
        const activity = await db[resourceType].findById(resourceId, 'rooms');
        const { rooms } = activity;
        // now we can get the users from each room
        const dbRooms = await db.Room.find({ _id: { $in: rooms } }, 'members');
        users = dbRooms.map((room) => room.members);
      }
      // now we have a list of users
      // we need to get the user objects from the ids
      const userIds = users.map((user) => user._id);
      // get each user from the db
      const usersFromDb = await db.User.find(
        { _id: { $in: userIds } },
        fields.join(' ')
      );
      return usersFromDb;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('error in getUsersByResource: ', err);
      return [];
    }
  },
};
