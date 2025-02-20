const _ = require('lodash');
const moment = require('moment');
// const { ObjectId } = require('mongodb');
const { Types } = require('mongoose');
const db = require('../models');
const STATUS = require('../constants/status');
const ROLE = require('../constants/role');
// const { areObjectIdsEqual } = require('../middleware/utils/helpers');

const { Tab } = db;
const { Room } = db;
const { Event } = db;
const { ObjectId } = Types;

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
        .populate({
          path: 'tabs',
          select: 'name tabType desmosLink controlledBy',
        })
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
        .populate({
          path: 'tabs',
          select: 'tabType name desmosLink controlledBy',
        })
        .select(
          'name creator activity members course graphImage privacySetting _id settings'
        )
        .then((room) => {
          resolve(room);
        })
        .catch((err) => reject(err));
    });
  },

  getPopulatedById: (id, params) => {
    let queryFcn;
    if (Array.isArray(id)) {
      const queryTimes = params.lastQueryTimes || {};
      // handle no ids case separately because $or doesn't accept an empty array
      queryFcn =
        id.length === 0
          ? () => db.Room.find({ _id: { $in: [] } })
          : () =>
              db.Room.find({
                $or: id.map((oneId) => ({
                  $or: [
                    {
                      _id: oneId,
                      dbUpdatedAt: {
                        $exists: false,
                      },
                    },
                    {
                      _id: oneId,
                      dbUpdatedAt: {
                        $exists: true,
                        $gt: new Date(queryTimes[oneId] || 0),
                      },
                    },
                  ],
                })),
              });
    } else {
      queryFcn = () => db.Room.findById(id);
    }
    return (
      queryFcn()
        .populate({ path: 'creator', select: 'username' })
        .populate({
          path: 'chat',
          // options: { limit: 25 }, // Eventually we'll need to paginate this
          populate: { path: 'user', select: 'username' },
          // allow messages to have roomIds, like events do
          // select: '-room',
        })
        .populate({ path: 'members.user', select: 'username' })
        // .populate({ path: 'currentMembers', select: 'username' })
        // .populate({ path: 'currentMembers' })
        .populate({ path: 'course', select: 'name' })
        .populate({ path: 'activity', select: 'name' })
        .populate(
          params.events === 'true' || params.events === true
            ? {
                path: 'tabs',
                populate: {
                  path: 'events',
                  populate: { path: 'user', select: 'username color' },
                },
              }
            : {
                path: 'tabs',
                select: 'name tabType snapshot desmosLink controlledBy',
              }
        )
        .lean()
    );
    // options: { limit: 25 },
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
    const initialFilter = {
      tempRoom: false,
      isTrashed: false,
      status: { $nin: [STATUS.ARCHIVED, STATUS.TRASHED] },
    };

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
                $eq: ['$$member.role', ROLE.FACILITATOR],
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
          // get the facilitator usernames; easier to keep this separate for the test
          facilitatorUsernames: {
            $map: {
              input: '$facilitatorObject',
              as: 'facilitator',
              in: '$$facilitator.username',
            },
          },
          // put the full user object into the members array
          members: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                role: '$$member.role',
                user: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: '$facilitatorObject',
                        as: 'facilitator',
                        cond: { $eq: ['$$facilitator._id', '$$member.user'] },
                      },
                    },
                    0,
                  ],
                },
              },
            },
          },
        },
      },
    ];

    if (criteria) {
      aggregationPipeline.push({
        $match: {
          $or: [
            { name: criteria },
            { description: criteria },
            { instructions: criteria },
            { facilitatorUsernames: criteria },
          ],
        },
      });
    }
    aggregationPipeline = aggregationPipeline.concat([
      {
        $lookup: {
          from: 'tabs',
          localField: 'tabs',
          foreignField: '_id',
          as: 'tabObject',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          // only keep the tabtype field of tabs
          tabs: {
            $map: {
              input: '$tabObject',
              as: 'tab',
              in: { tabType: '$$tab.tabType' },
            },
          },
          privacySetting: 1,
          updatedAt: 1,
          // put each member into the proper form, keeping only the _id and username
          members: {
            $map: {
              input: '$members',
              as: 'member',
              in: {
                role: '$$member.role',
                user: {
                  _id: '$$member.user._id',
                  username: '$$member.user.username',
                },
              },
            },
          },
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
    const rooms = await Room.aggregate(aggregationPipeline).allowDiskUse(true);
    return rooms;
  },

  /**
   * @method post - creates a room (and tabs if necessary)
   * @param  {body} - fields for creating new room and tabs (kind of a room configuration object)
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

      const getCurrentStateBase64 = (tab) => {
        switch (tab.roomType || tab.tabType) {
          case 'desmosActivity':
            return '{}';
          case 'pyret':
            return tab.currentStateBase64 || tab.desmosLink;
          default:
            return tab.currentStateBase64;
        }
      };
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
            startingPointBase64:
              tab.tabType === 'desmosActivity'
                ? tab.startingPointBase64
                : tab.currentStateBase64,
            currentStateBase64: getCurrentStateBase64(tab),
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
            startingPoint: '',
            // startingPointBase64 and currentStateBase64 should be in the body only if we are creating a new desmos activity.
            startingPointBase64: body.startingPointBase64,
            currentStateBase64: getCurrentStateBase64(body),
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
          {
            path: 'members.user tabs',
            select: 'username tabType desmosLink name events controlledBy',
          },
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
          const newMember = { user, role, color };

          const newMemberIndex = room.members.findIndex((mem) => {
            return mem.user.toString() === user;
          });
          if (newMemberIndex >= 0) {
            room.members[newMemberIndex] = {
              _id: room.members[newMemberIndex]._id,
              user,
              role,
              color,
            };
          } else room.members.push(newMember);

          return room.save({ timestamps: false });
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

  // NOT USED??? This function is misnamed. It is used to remove a user from a room (rather than to remove a room)
  remove: (id, body) => {
    return new Promise((resolve, reject) => {
      db.Notification.find({ resourceId: id })
        .then((ntfs) => {
          const ntfIds = ntfs.map((ntf) => ntf._id);
          db.User.findByIdAndUpdate(body.members.user, {
            $pull: {
              rooms: id,
              notifications: { $in: ntfIds },
            },
          }).then(() => {
            // TODO delete notification that matches user ntfs
            // db.Notification.delete({ _id: { $in: ntfIds } })
          });
        })
        .catch((err) => reject(err)); // @todo there is no real error handling for this
      db.Room.findByIdAndUpdate(
        id,
        { $pull: body },
        { new: true, timestamps: false }
      )
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
      }
      if (body.checkAccess) {
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
              role: ROLE.PARTICIPANT,
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
              return m.role === ROLE.FACILITATOR;
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
      } else if (body.isTrashed || body.status === STATUS.TRASHED) {
        removeAndChangeStatus(id, STATUS.TRASHED, reject, resolve);
      } else if (body.status === STATUS.ARCHIVED) {
        removeAndChangeStatus(id, STATUS.ARCHIVED, reject, resolve);
      } else {
        // unarchive if flag is set
        let willUnarchive = false;
        if (body.unarchive) {
          delete body.unarchive;
          unarchive(id);
          willUnarchive = true;
        }
        const doUpdateTabVisitors =
          typeof body.instructions === 'string' && body.instructions.length > 0;
        db.Room.findByIdAndUpdate(id, body, {
          new: true,
          timestamps: !willUnarchive,
        })
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

  setCurrentMembers: (roomId, currentUsers) => {
    return new Promise(async (resolve, reject) => {
      // IF THIS IS A TEMP ROOM MEMBERS WILL HAVE A VALUE
      const query = { $set: { currentMembers: currentUsers } };

      db.Room.findByIdAndUpdate(roomId, query, {
        new: true,
        timestamps: false,
      })
        .select('currentMembers members controlledBy settings')
        .then((room) => {
          room.populate(
            { path: 'members.user', select: 'username' },
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

  // when a currentMember switches tabs, update the currentMembers array
  updateCurrentMemberTab: async (roomId, userId, newTabId) => {
    const room = await db.Room.findById(roomId);
    const currentMember = room.currentMembers.find(
      (member) => String(member._id) === String(userId)
    );
    if (!currentMember) {
      // eslint-disable-next-line no-console
      console.log(
        'no current member found, returning previous currentMembers from db'
      );
      return room.currentMembers;
    }
    currentMember.tab = newTabId;

    await room.save();
    return room.currentMembers;
  },

  addCurrentMember: (roomId, newCurrentMember) => {
    return new Promise(async (resolve, reject) => {
      // IF THIS IS A TEMP ROOM MEMBERS WILL HAVE A VALUE
      const query = { $addToSet: { currentMembers: newCurrentMember } };
      db.Room.findByIdAndUpdate(roomId, query, { new: true, timestamps: false })
        // .populate({ path: 'members.user', select: 'username' })
        .select('currentMembers members')
        .then((room) => {
          room.populate(
            { path: 'members.user', select: 'username' },
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

  removeCurrentMember: (roomId, userId) => {
    return new Promise((resolve, reject) => {
      db.Room.findByIdAndUpdate(
        roomId,
        { $pull: { currentMembers: { _id: userId } } },
        { timestamps: false }
      ) // dont return new! we need the original list to filter back in sockets.js
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
    const initialFilter = {
      updatedAt: { $gte: new Date(since) },
      isTrashed: false,
      status: { $nin: [STATUS.ARCHIVED, STATUS.TRASHED] },
    };
    // eslint-disable-next-line no-unused-vars
    if (to && since && to > since) {
      let toMomentObj = moment(to, 'x', true);
      if (!toMomentObj.isValid()) {
        toMomentObj = moment();
      }
      to = Number(toMomentObj.endOf('day').format('x'));
      initialFilter.updatedAt.$lte = new Date(to);
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
          members: {
            $filter: {
              input: '$members',
              as: 'member',
              cond: {
                $eq: ['$$member.role', ROLE.FACILITATOR],
              },
            },
          },
          tempRoom: 1,
          messagesCount: { $size: '$chat' },
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
          messagesCount: 1,
          facilitatorUsernames: {
            $map: {
              input: '$facilitatorObject',
              as: 'facilitator',
              in: '$$facilitator.username',
            },
          },
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
            { facilitatorUsernames: criteria },
          ],
        },
      });
    }
    pipeline.push(
      {
        $lookup: {
          from: 'tabs',
          localField: 'tabs',
          foreignField: '_id',
          as: 'tabObject',
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          instructions: 1,
          description: 1,
          image: 1,
          privacySetting: 1,
          updatedAt: 1,
          members: 1,
          tempRoom: 1,
          messagesCount: 1,
          tabs: {
            $map: {
              input: '$tabObject',
              as: 'tab',
              in: { tabType: '$$tab.tabType' },
            },
          },
        },
      },
      {
        $facet: {
          paginatedResults: [
            { $sort: { updatedAt: -1 } },
            { $skip: skip ? parseInt(skip, 10) : 0 },
            { $limit: 20 },
          ],
          totalCount: [
            { $count: 'count' }, // Count total documents matching the criteria
          ],
        },
      },
      {
        $project: {
          paginatedResults: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] }, // Extract the total count
        },
      }
    );

    const [results] = await Room.aggregate(pipeline);

    const { paginatedResults: rooms, totalCount } = results;

    const roomIds = rooms.map((room) => room._id);
    const eventsPipeline = [
      { $match: { room: { $in: roomIds } } },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      {
        $project: {
          _id: 1,
          room: 1,
          user: 1,
          userDetails: {
            $map: {
              input: '$userDetails',
              as: 'user',
              in: {
                _id: '$$user._id',
                username: '$$user.username',
              },
            },
          },
        },
      },
      {
        $group: {
          _id: '$room', // Group by room ID
          eventsCount: { $sum: 1 }, // Count the number of events for this room
          activeMembers: {
            $addToSet: {
              $arrayElemAt: ['$userDetails', 0], // Add the first (and only) user object from userDetails, ensuring only _id and username
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          eventsCount: 1,
          activeMembers: 1,
        },
      },
    ];

    const roomEvents = await Event.aggregate(eventsPipeline);

    // Map room events to rooms
    const updatedRooms = rooms.map((room) => {
      const roomEvent = roomEvents.find(
        (r) => String(r._id) === String(room._id)
      );
      return {
        ...room,
        eventsCount: roomEvent ? roomEvent.eventsCount : 0,
        activeMembers: roomEvent ? roomEvent.activeMembers : [],
      };
    });

    return [updatedRooms, { totalCount }];
  },

  // criteria will be various filters selected by the user as an object. searchText is the string the user types.
  // ids is an array of room ids
  // skip is a number specifying the starting result to return.
  searchPaginatedArchive: async (searchText, skip, filters) => {
    const criteria = await convertSearchFilters(filters);
    criteria.status = STATUS.ARCHIVED;

    const roomsPipeline = [
      {
        $match: criteria,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'members.user',
          foreignField: '_id',
          as: 'userObject',
        },
      },
      {
        $project: {
          updatedAt: 1,
          createdAt: 1,
          name: 1,
          instructions: 1,
          description: 1,
          'members.role': 1,
          'members.user': 1,
          'userObject.username': 1,
          'userObject._id': 1,
          messagesCount: { $size: '$chat' },
        },
      },
    ];
    if (searchText) {
      roomsPipeline.push({
        $match: {
          $or: [
            { name: searchText },
            { description: searchText },
            { instructions: searchText },
            {
              'members.role': 'facilitator',
              'userObject.username': searchText,
            },
          ],
        },
      });
    }
    roomsPipeline.push(
      { $sort: { updatedAt: -1 } },
      { $skip: skip ? parseInt(skip, 10) : 0 },
      { $limit: 20 }
    );

    const rooms = await Room.aggregate(roomsPipeline);
    const roomIds = rooms.map((room) => room._id);
    const tabsPipeline = [
      {
        $match: {
          room: { $in: roomIds },
        },
      },
      {
        $project: {
          tabType: 1,
          eventCount: { $size: '$events' },
          room: 1,
        },
      },
      {
        $group: {
          _id: '$room',
          tabTypes: { $addToSet: '$tabType' },
          eventCount: { $sum: '$eventCount' },
        },
      },
    ];
    const tabs = await Tab.aggregate(tabsPipeline);
    const updatedRooms = rooms.map((room) => {
      const tab = tabs.find((t) => String(t._id) === String(room._id));
      if (room.members && room.userObject) {
        room.members.forEach(
          // eslint-disable-next-line no-return-assign
          (member) =>
            (member.user = room.userObject.find(
              (user) => user._id.toString() === member.user.toString()
            ))
        );
      }
      delete room.userObject;
      return {
        ...room,
        tabTypes: tab.tabTypes,
        eventCount: tab.eventCount,
      };
    });

    return updatedRooms;
  },

  // add a member to the course
  addMember: (roomId, member) => {
    return db.Room.findOneAndUpdate(
      { _id: roomId },
      { $addToSet: { members: member } }
    );
  },
};

// When the status is changed to something indicating the hiding of a room (right now, trashed or archived),
// we need to (a) change the status in the DB, (b) remove the room and any notifications about the room from all room members,
// (c) delete those notifications, and (d) remove that room from its course.

// In the case of archiving, we also need to (e) add the room to the list of archived rooms for each room member who is a room facilitator.
const removeAndChangeStatus = (id, status, reject, resolve) => {
  let updatedRoom;
  db.Room.findById(id)
    .then(async (room) => {
      room.status = status;
      try {
        updatedRoom = await room.save({ timestamps: false });
        if (room.course && status === STATUS.ARCHIVED) {
          await db.Course.updateOne(
            { _id: room.course },
            {
              $addToSet: { 'archive.rooms': ObjectId(id) },
            }
          );
        }
      } catch (err) {
        reject(err);
      }
      const userIds = room.members.map((member) => member.user);
      // Delete any notifications associated with this room
      return db.Notification.find({ resourceId: id }).then((ntfs) => {
        const ntfIds = ntfs.map((ntf) => ntf._id);
        const promises = [
          db.User.updateMany(
            { _id: { $in: userIds } },
            {
              $pull: {
                rooms: id,
                notifications: { $in: ntfIds },
              },
            }
          ),
        ];
        promises.push(db.Notification.deleteMany({ _id: { $in: ntfIds } }));

        // add the room to the list of archived rooms for any facilitators
        if (status === STATUS.ARCHIVED) {
          const facilitatorIds = room.members
            .filter((member) => member.role === ROLE.FACILITATOR)
            .map((member) => member.user);
          promises.push(
            db.User.updateMany(
              { _id: { $in: facilitatorIds } },
              { $addToSet: { 'archive.rooms': ObjectId(id) } }
            )
          );
        }

        // delete this room from any courses
        if (room.course) {
          promises.push(
            db.Course.findByIdAndUpdate(room.course, {
              $pull: { rooms: id },
            })
          );
        }
        // delete this room from any activities (templates)
        if (room.activity) {
          promises.push(
            db.Activity.findByIdAndUpdate(room.activity, {
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
};

// takes a filters as an object and returns an object that can be used in a Mongoose query.
const convertSearchFilters = async (filters) => {
  const criteria = {
    tempRoom: false,
    isTrashed: false,
  };
  if (filters.ids && Array.isArray(filters.ids)) {
    criteria._id = { $in: filters.ids.map((id) => new ObjectId(id)) };
  }
  if (filters.to || filters.from) {
    criteria.updatedAt = {};
    if (filters.from)
      criteria.updatedAt = { $gte: new Date(Number(filters.from)) };
    if (filters.to) criteria.updatedAt = { $lte: new Date(Number(filters.to)) };
  }

  if (filters.roomType) {
    const tabIds = await prefetchTabIds(
      filters.ids.map((id) => new ObjectId(id)),
      filters.roomType
    );

    criteria.tabs = {
      $in: tabIds,
    };
  }
  return criteria;
};

// if filters.roomType, search tab collection (if we have filters.ids, match by room field), looking for tabTYpe = roomType.
// extract the tab ids from the results. When we do the rooms search, include {tabs: {$in: tabIds}} in the initial match.

const prefetchTabIds = async (roomIds, tabType) => {
  const tabsPipeline = roomIds
    ? [{ $match: { room: { $in: roomIds }, tabType } }]
    : [{ $match: { tabType } }];

  const tabs = await Tab.aggregate(tabsPipeline);
  return tabs.map((tab) => tab._id);
};

const unarchive = (id) => {
  db.Room.findById(id).then(async (room) => {
    const userIds = room.members.map((member) => member.user);

    try {
      const promises = [];

      // remove room from each archive.rooms for each room member
      // note: only facilitators of the room have the room added to their archive.rooms field
      // add the room to each room member's room list
      promises.push(
        db.User.updateMany(
          { _id: { $in: userIds } },
          {
            $pull: { 'archive.rooms': ObjectId(id) },
            $addToSet: { rooms: id },
          }
        )
      );

      // add this room back to course
      if (room.course) {
        promises.push(
          db.Course.findByIdAndUpdate(room.course, {
            $push: { rooms: id },
            $pull: { 'archive.rooms': id },
          })
        );
      }

      // add this room back to activity
      if (room.activity) {
        promises.push(
          db.Activity.findByIdAndUpdate(room.activity, {
            $push: { rooms: id },
          })
        );
      }

      await Promise.all(promises);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  });
};
