const _ = require('lodash');
const moment = require('moment');
const db = require('../models');
// const { areObjectIdsEqual } = require('../middleware/utils/helpers');

const { Tab } = db;
const { Room } = db;

const colorMap = require('../constants/colorMap');

module.exports = {
  get: (params) => {
    if (params && params.constructor === Array) {
      params = { _id: { $in: params } };
    } else {
      params = params || {};
      params.tempRoom = false; // we don't want any temporary rooms
    }
    return new Promise((resolve, reject) => {
      db.Room.find(params)
        .sort('-createdAt')
        .populate({ path: 'members.user', select: 'username' })
        .populate({ path: 'currentMembers', select: 'username' })
        .populate({ path: 'tabs', select: 'name tabType' })
        .then((rooms) => {
          // rooms = rooms.map(room => room.tempRoom ? room : room.summary())
          resolve(rooms);
        })
        .catch((err) => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
        .populate({ path: 'creator', select: 'username' })
        // .populate({
        //   path: 'chat',
        //   populate: { path: 'user', select: 'username' },
        //   select: '-room',
        // })
        .populate({ path: 'members.user', select: 'username' })
        // .populate({ path: 'currentMembers.user', select: 'username' })
        .populate({ path: 'course', select: 'name' })
        // .populate({
        //   path: 'tabs',
        //   populate: { path: params.events ? 'events' : '' },
        // })
        .populate({ path: 'graphImage', select: 'imageData' })
        .select('name creator members course graphImage privacySetting _id')
        .then((room) => {
          resolve(room);
        })
        .catch((err) => reject(err));
    });
  },

  getPopulatedById: (id, params) => {
    return db.Room.findById(id)
      .populate({ path: 'creator', select: 'username' })
      .populate({
        path: 'chat',
        // options: { limit: 25 }, // Eventually we'll need to paginate this
        populate: { path: 'user', select: 'username' },
        select: '-room',
      })
      .populate({ path: 'members.user', select: 'username' })
      .populate({ path: 'currentMembers', select: 'username' })
      .populate({ path: 'course', select: 'name' })
      .populate({
        path: 'tabs',
        populate: {
          path: params.events ? 'events' : '',
          populate: params.events
            ? { path: 'user', select: 'username color' }
            : '',
          // options: { limit: 25 },
        },
      });
  },

  // returns the current state for each tab...does not return events or any other information
  getCurrentState: (id) => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
        .select('tabs')
        .populate({ path: 'tabs', select: 'currentState' })
        .lean()
        .then((room) => {
          resolve(room);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  searchPaginated: async (criteria, skip, filters) => {
    const initialFilter = { tempRoom: false, isTrashed: false };

    const allowedPrivacySettings = ['private', 'public'];

    if (allowedPrivacySettings.includes(filters.privacySetting)) {
      initialFilter.privacySetting = filters.privacySetting;
    }

    let aggregationPipeline = [
      { $match: initialFilter },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          tabs: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: {
            $filter: {
              input: '$members',
              as: 'member',
              cond: {
                $eq: ['$$member.role', 'facilitator'],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members.user',
          foreignField: '_id',
          as: 'facilitatorObject',
        },
      },

      { $unwind: '$facilitatorObject' },
    ];

    if (criteria) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { name: criteria },
            { description: criteria },
            { instructions: criteria },
            { 'facilitatorObject.username': criteria },
          ],
        },
      });
    }
    aggregationPipeline = aggregationPipeline.concat([
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          instructions: { $first: '$instructions' },
          description: { $first: '$description' },
          privacySetting: { $first: '$privacySetting' },
          image: { $first: '$image' },
          tabs: { $first: '$tabs' },
          updatedAt: { $first: '$updatedAt' },
          members: {
            $push: { user: '$facilitatorObject', role: 'facilitator' },
          },
        },
      },
      {
        $lookup: {
          from: 'tabs',
          localField: 'tabs',
          foreignField: '_id',
          as: 'tabObject',
        },
      },
      { $unwind: '$tabObject' },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          instructions: { $first: '$instructions' },
          description: { $first: '$description' },
          privacySetting: { $first: '$privacySetting' },
          image: { $first: '$image' },
          updatedAt: { $first: '$updatedAt' },
          members: { $first: '$members' },
          tabs: { $push: '$tabObject' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          'tabs.tabType': 1,
          privacySetting: 1,
          updatedAt: 1,
          'members.role': 1,
          'members.user.username': 1,
          'members.user._id': 1,
        },
      },
    ]);

    if (filters.roomType) {
      aggregationPipeline.push({
        $match: {
          tabs: {
            $elemMatch: { tabType: filters.roomType },
          },
        },
      });
    }
    aggregationPipeline.push({ $sort: { updatedAt: -1 } });

    if (skip) {
      aggregationPipeline.push({ $skip: parseInt(skip, 10) });
    }
    aggregationPipeline.push({ $limit: 20 });
    const rooms = await Room.aggregate(aggregationPipeline);
    return rooms;
  },

  /**
   * @method post - creates a room (and tabs if necessary)
   * @param  {body} - fields for creating new room and tabs
   */
  post: (body) => {
    return new Promise(async (resolve, reject) => {
      // Prepare the tabs if they exist
      let existingTabs;
      if (body.tabs) {
        existingTabs = Object.assign([], body.tabs);
      } else if (body.activities) {
        try {
          const activities = await db.Activity.find({
            _id: { $in: body.activities },
          }).populate('tabs');
          existingTabs = activities.reduce(
            (acc, activity) => acc.concat(activity.tabs),
            []
          );
        } catch (err) {
          reject(err);
        }
      } else if (
        body.sourceRooms &&
        Array.isArray(body.selectedTabIds) &&
        body.selectedTabIds.length > 0
      ) {
        // creating activity from existing room
        existingTabs = await db.Tab.find({
          _id: { $in: body.selectedTabIds },
        });
      }

      if (body.mathState) {
        existingTabs.forEach((tab, i, array) => {
          if (body.mathState[tab._id] && tab.tabType === 'geogebra') {
            array[i].currentStateBase64 = body.mathState[tab._id];
          } else if (body.mathState[tab._id] && tab.tabType === 'desmos') {
            array[i].currentState = body.mathState[tab._id];
          }
        });
      }
      let tabModels;
      delete body.tabs;
      delete body.mathState;
      let ggbFiles;

      if (Array.isArray(body.ggbFiles)) {
        ggbFiles = [...body.ggbFiles];
        delete body.ggbFiles;
      }
      const room = new Room(body);
      if (existingTabs) {
        tabModels = existingTabs.map((tab) => {
          const newTab = new Tab({
            name: tab.name,
            room: room._id,
            ggbFile: tab.ggbFile,
            desmosLink: tab.desmosLink,
            currentState: tab.currentState,
            startingPoint: tab.currentState,
            startingPointBase64: tab.currentStateBase64,
            currentStateBase64: tab.currentStateBase64,
            tabType: tab.tabType,
            appName: tab.appName,
          });
          return newTab;
        });
      } else if (Array.isArray(ggbFiles) && ggbFiles.length > 0) {
        tabModels = ggbFiles.map((file, index) => {
          return new Tab({
            name: `Tab ${index + 1}`,
            room: room._id,
            ggbFile: file,
            tabType: body.roomType,
            appName: body.appName,
          });
        });
      } else {
        tabModels = [
          new Tab({
            name: 'Tab 1',
            room: room._id,
            startingpoint: '',
            desmosLink: body.desmosLink,
            tabType: body.roomType || 'geogebra',
            appName: body.appName,
          }),
        ];
      }
      room.tabs = tabModels.map((tab) => tab._id);
      try {
        await tabModels.forEach((tab) => tab.save()); // These could run in parallel I suppose but then we'd have to edit one if ther ewas a failuer with the other
        await room.save();
        room.populate(
          { path: 'members.user tabs', select: 'username tabType name events' },
          (err, populatedRoom) => {
            if (err) reject(err);
            resolve(populatedRoom);
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  },

  // Used for when a facilitator adds a new member. This is poorly organized and documents
  // but the put method is for when a user grants themself access or requests access.
  add: (id, body) => {
    return new Promise((resolve, reject) => {
      let room;
      let newMembers;
      const { ntfType, members } = body;
      const { user, role } = members;
      delete body.ntfType;
      db.Room.findById(id)
        // .populate({ path: "members.user", select: "username" })
        .then((res) => {
          room = res;
          // TODO refactor with room member states to change color assignment to state
          const color = colorMap[room.members.length];
          room.members.push({ user, role, color });
          return room.save();
        })
        .then((savedRoom) => {
          return savedRoom.populate(
            {
              path: 'members.user',
              select: 'username',
            },
            () => {} // !! This is strange, but if we don't provide a callback here the population does not work
          );
        })
        .then((populatedRoom) => {
          newMembers = populatedRoom.members;
          return db.User.findByIdAndUpdate(user, {
            $addToSet: {
              rooms: id,
            },
          });
        })
        .then(() => {
          return db.Notification.create({
            resourceType: 'room',
            resourceId: id,
            toUser: body.members.user,
            notificationType: ntfType,
            parentResource: room.course,
          });
        })
        .then(() => resolve(newMembers))
        .catch((err) => reject(err));
    });
  },

  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      db.User.findByIdAndUpdate(body.members.user, { $pull: { rooms: id } }); // @todo there is no error handling for this
      db.Room.findByIdAndUpdate(id, { $pull: body }, { new: true })
        .populate({ path: 'members.user', select: 'username' })
        .then((res) => {
          resolve(res.members);
        })
        .catch((err) => reject(err));
    });
  },

  // THIS IS A MESS @TODO CLEAN UP
  put: (id, body) => {
    return new Promise((resolve, reject) => {
      if (body.graphImage) {
        db.Room.findById(id)
          .then((room) => {
            db.Image.findByIdAndUpdate(room.graphImage, {
              imageData: body.graphImage.imageData,
            }).then(() => {
              return resolve();
            });
          })
          .catch((err) => {
            reject(err);
          });
      } else if (body.checkAccess) {
        let roomToPopulate;
        let fromUser;
        db.Room.findById(id)
          .then(async (room) => {
            const { entryCode, userId } = body.checkAccess;
            fromUser = userId;
            // @todo we should encrypt this
            if (
              room.entryCode !== entryCode &&
              room.privacySetting === 'private'
            ) {
              throw 'Incorrect Entry Code';
            }
            // correctCode, update room with user
            if (
              _.find(
                room.members,
                (member) => member.user.toString() === userId
              )
            ) {
              throw 'You have already been granted access to this room!';
            }
            // Add this member to the room
            room.members.push({
              user: userId,
              role: 'participant',
              color: colorMap[room.members.length],
            });
            try {
              await db.User.findByIdAndUpdate(fromUser, {
                $addToSet: {
                  rooms: id,
                },
              });
            } catch (err) {
              throw err;
            }
            return room.save();
          })
          .then((updatedRoom) => {
            // create notifications
            roomToPopulate = updatedRoom;
            const facilitators = updatedRoom.members.filter((m) => {
              return m.role === 'facilitator';
            });
            return Promise.all(
              facilitators.map((f) => {
                return db.Notification.create({
                  resourceType: 'room',
                  resourceId: roomToPopulate._id,
                  notificationType: 'newMember',
                  toUser: f.user,
                  fromUser,
                  parentResource: roomToPopulate.course,
                });
              })
            );
          })
          .then(() => {
            roomToPopulate.populate(
              { path: 'members.user', select: 'username' },
              function() {
                resolve(roomToPopulate);
              }
            );
          })
          .catch((err) => {
            reject(err);
          });
      } else if (Object.keys(body)[0] === 'tempRoom') {
        db.Room.findById(id).then(async (room) => {
          room.tempRoom = body.tempRoom;
          try {
            await room.save();
            resolve();
          } catch (err) {
            reject(err);
          }
        });
      } else if (body.isTrashed) {
        let updatedRoom;
        db.Room.findById(id)
          .then(async (room) => {
            room.isTrashed = true;
            try {
              updatedRoom = await room.save();
            } catch (err) {
              reject(err);
            }
            const userIds = room.members.map((member) => member.user);
            // Delete any notifications associated with this room
            return db.Notification.find({ resourceId: id }).then((ntfs) => {
              const ntfIds = ntfs.map((ntf) => ntf._id);
              const promises = [
                db.User.update(
                  { _id: { $in: userIds } },
                  {
                    $pull: {
                      rooms: id,
                      notifications: { $in: ntfIds },
                    },
                  },
                  { multi: true }
                ),
              ];
              promises.push(
                db.Notification.deleteMany({ _id: { $in: ntfIds } })
              );
              // delete this room from any courses
              if (room.course) {
                promises.push(
                  db.Course.findByIdAndUpdate(room.course, {
                    $pull: { rooms: id },
                  })
                );
              }
              return Promise.all(promises);
            });
          })
          .then(() => {
            resolve(updatedRoom);
          })
          .catch((err) => {
            reject(err);
          });
      } else {
        const doUpdateTabVisitors =
          typeof body.instructions === 'string' && body.instructions.length > 0;
        db.Room.findByIdAndUpdate(id, body, { new: true })
          .populate('currentMembers.user members.user', 'username')
          .populate('chat') // this seems random
          .then((res) => {
            const firstTab = res && res.tabs[0];
            if (doUpdateTabVisitors && firstTab) {
              // we do not want to wait for this to finish before resolving
              // what if it fails?
              Tab.findById(firstTab._id).then((tab) => {
                if (tab && !tab.instructions) {
                  tab.visitorsSinceInstructionsUpdated = [];
                  tab.save();
                }
              });
            }
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          })
          .catch((err) => reject(err));
      }
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.Room.findById(id)
        .then((room) => {
          room.remove();
          resolve(room);
        })
        .catch((err) => reject(err));
    });
  },

  // SOCKET METHODS
  addCurrentUsers: (roomId, newCurrentUserId, members) => {
    return new Promise(async (resolve, reject) => {
      // IF THIS IS A TEMP ROOM MEMBERS WILL HAVE A VALYE
      const query = members
        ? { $addToSet: { currentMembers: newCurrentUserId, members } }
        : { $addToSet: { currentMembers: newCurrentUserId } };
      db.Room.findByIdAndUpdate(roomId, query, { new: true })
        // .populate({ path: 'members.user', select: 'username' })
        .select('currentMembers members')
        .then((room) => {
          room.populate(
            { path: 'currentMembers members.user', select: 'username' },
            (err, poppedRoom) => {
              if (err) {
                reject(err);
              }
              resolve(poppedRoom);
            }
          );
        })
        .catch((err) => reject(err));
    });
  },

  removeCurrentUsers: (roomId, userId) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(roomId, { $pull: { currentMembers: userId } }) // dont return new! we need the original list to filter back in sockets.js
        .populate({ path: 'currentMembers', select: 'username' })
        .select('currentMembers controlledBy')
        .then((room) => {
          resolve(room);
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
    let eventsFilter = { $gte: ['$$e.timestamp', since] };

    if (to && since && to > since) {
      let toMomentObj = moment(to, 'x', true);
      if (!toMomentObj.isValid()) {
        toMomentObj = moment();
      }

      to = Number(toMomentObj.endOf('day').format('x'));
      initialFilter.updatedAt.$lte = new Date(to);

      eventsFilter = {
        $and: [eventsFilter, { $lte: ['$$e.timestamp', to] }],
      };
    }

    const pipeline = [
      { $match: initialFilter },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          tabs: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: 1,
          tempRoom: 1,
          chat: 1,
        },
      },
      {
        $lookup: {
          from: 'tabs',
          localField: 'tabs',
          foreignField: '_id',
          as: 'tabObject',
        },
      },

      {
        $unwind: {
          path: '$tabObject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'events',
          localField: 'tabObject.events',
          foreignField: '_id',
          as: 'eventObject',
        },
      },
      { $unwind: { path: '$eventObject', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          instructions: { $first: '$instructions' },
          description: { $first: '$description' },
          privacySetting: { $first: '$privacySetting' },
          image: { $first: '$image' },
          updatedAt: { $first: '$updatedAt' },
          members: { $first: '$members' },
          tabs: { $first: '$tabs' },
          events: { $push: '$eventObject' },
          tempRoom: { $first: '$tempRoom' },
          chat: { $first: '$chat' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          tabs: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: 1,
          tempRoom: 1,
          chat: 1,

          events: {
            $filter: {
              input: '$events',
              as: 'e',
              cond: eventsFilter,
            },
          },
        },
      },
      {
        $lookup: {
          from: 'messages',
          localField: 'chat',
          foreignField: '_id',
          as: 'messageObject',
        },
      },
      {
        $unwind: {
          path: '$messageObject',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          instructions: { $first: '$instructions' },
          description: { $first: '$description' },
          privacySetting: { $first: '$privacySetting' },
          image: { $first: '$image' },
          updatedAt: { $first: '$updatedAt' },
          members: { $first: '$members' },
          tabs: { $first: '$tabs' },
          events: { $first: '$events' },
          tempRoom: { $first: '$tempRoom' },
          messages: { $push: '$messageObject' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          tabs: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: 1,
          tempRoom: 1,
          events: 1,

          messages: {
            $filter: {
              input: '$messages',
              as: 'e',
              cond: eventsFilter,
            },
          },
        },
      },

      { $unwind: { path: '$events', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          instructions: { $first: '$instructions' },
          description: { $first: '$description' },
          privacySetting: { $first: '$privacySetting' },
          image: { $first: '$image' },
          updatedAt: { $first: '$updatedAt' },
          members: { $first: '$members' },
          tabs: { $first: '$tabs' },
          events: { $push: '$events' },
          messages: { $first: '$messages' },
          activeMembers: { $addToSet: '$events.user' },
          tempRoom: { $first: '$tempRoom' },
        },
      },
      { $unwind: { path: '$messages', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          instructions: { $first: '$instructions' },
          description: { $first: '$description' },
          privacySetting: { $first: '$privacySetting' },
          image: { $first: '$image' },
          updatedAt: { $first: '$updatedAt' },
          members: { $first: '$members' },
          tabs: { $first: '$tabs' },
          events: { $first: '$events' },
          messages: { $push: '$messages' },
          activeMembers: { $first: '$activeMembers' },
          activeMembersMessages: { $addToSet: '$messages.user' },
          tempRoom: { $first: '$tempRoom' },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          tabs: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: 1,
          activeMembers: {
            $concatArrays: ['$activeMembers', '$activeMembersMessages'],
          },
          eventsCount: { $size: '$events' },
          messagesCount: { $size: '$messages' },
          tempRoom: 1,
        },
      },

      {
        $lookup: {
          from: 'users',
          localField: 'activeMembers',
          foreignField: '_id',
          as: 'activeMembers',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          tabs: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: 1,
          'activeMembers.username': 1,
          'activeMembers._id': 1,
          eventsCount: 1,
          messagesCount: 1,
          tempRoom: 1,
        },
      },
    ];

    if (criteria) {
      pipeline.push({
        $match: {
          $or: [
            { name: criteria },
            { description: criteria },
            { instructions: criteria },
            { 'activeMembers.username': criteria },
          ],
        },
      });
    }

    pipeline.push({
      $facet: {
        paginatedResults: [
          { $sort: { updatedAt: -1, eventsCount: -1 } },
          { $skip: skip ? parseInt(skip, 10) : 0 },
          { $limit: 20 },
          {
            $project: {
              _id: 1,
              name: 1,
              instructions: 1,
              description: 1,
              image: 1,
              tabs: 1,
              privacySetting: 1,
              updatedAt: 1,
              members: 1,
              'activeMembers.username': 1,
              'activeMembers._id': 1,
              eventsCount: 1,
              tempRoom: 1,
              messagesCount: 1,
            },
          },
        ],
        totalCount: [
          {
            $count: 'count',
          },
        ],
      },
    });
    const [results] = await Room.aggregate(pipeline).allowDiskUse(true);

    const { paginatedResults: rooms, totalCount } = results;

    return [
      rooms,
      { totalCount: totalCount && totalCount[0] ? totalCount[0].count : 0 },
    ];
  },
};
