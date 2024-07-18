const db = require('../models');
const STATUS = require('../constants/status');
const moment = require('moment');

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Activity.find(params)
        .populate('tabs')
        .then((activities) => {
          resolve(activities);
        })
        .catch((err) => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      (Array.isArray(id)
        ? db.Activity.findById({ _id: { $in: id } })
        : db.Activity.findById(id)
      )
        .populate('tabs')
        .then((activity) => resolve(activity))
        .catch((err) => reject(err));
    });
  },

  getPopulatedById: (id) => {
    return new Promise((resolve, reject) => {
      db.Activity.findById(id)
        .populate('tabs rooms')
        .populate({
          path: 'rooms',
          populate: { path: 'members.user', select: 'username' },
        })
        .then((activity) => resolve(activity))
        .catch((err) => reject(err));
    });
  },

  // @PARAMS: fields (array of strings to be selected), skip (number), limit (number)
  // @RETURN: object with activities and totalResults
  // @DESC: return all activities with only the fields specified
  // don't populate any fields
  // don't return any trashed activities
  // return an object with activities and totalResults

  getFieldsUnpopulated: async (fields, skip = 0, limit = 100) => {
    const totalResults = await db.Activity.countDocuments({ isTrashed: false });
    const activities = await db.Activity.find({ isTrashed: false })
      .select(fields.join(' '))
      .populate(
        fields.includes('tabs')
          ? {
              path: 'tabs',
              select: '_id name tabType updatedAt',
            }
          : ''
      )
      .sort({ updatedAt: -1 });
    // refactor to use skip and limit
    // .skip(Number(skip))
    // .limit(Number(limit));
    if (!activities) {
      // eslint-disable-next-line no-console
      console.log(`Error in ActivityController.getFieldsUnpopulatedPaginated`);
      return new Error(
        'Error in ActivityController.getFieldsUnpopulatedPaginated'
      );
    }
    const currentPage = Math.floor(skip / limit) + 1;
    const totalPages = Math.ceil(totalResults / limit);
    const hasNextPage = currentPage < totalPages;
    const hasPreviousPage = currentPage > 1;
    return {
      activities,
      totalResults,
      currentPage,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  },

  searchPaginated: async (criteria, skip, filters) => {
    const initialFilter = { isTrashed: false };
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
          creator: 1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creatorObject',
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
            { 'creatorObject.username': criteria },
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
          // keep only the tabType of each tab
          tabs: {
            $map: {
              input: '$tabObject',
              as: 'tab',
              in: { tabType: '$$tab.tabType' },
            },
          },
          privacySetting: 1,
          updatedAt: 1,
          // keep only the username and _id of creator
          creator: {
            $let: {
              vars: {
                firstCreator: { $arrayElemAt: ['$creatorObject', 0] },
              },
              in: {
                username: '$$firstCreator.username',
                _id: '$$firstCreator._id',
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
    const activities = await db.Activity.aggregate(
      aggregationPipeline
    ).allowDiskUse(true);
    return activities;
  },

  post: (body) => {
    return new Promise(async (resolve, reject) => {
      let existingTabs;

      // This indicates we're copying 1 or more activities
      if (body.activities) {
        // We should save these "SOURCE" activities on the new acitivty so we know where they cam from

        // users now have the option to exclude certain tabs when copying
        // a single activity from the activity room
        const { selectedTabIds = [] } = body;
        try {
          const activities = await db.Activity.find({
            _id: { $in: body.activities },
          })
            .populate('tabs')
            .lean()
            .exec();
          existingTabs = activities.reduce((acc, activity) => {
            const filtered =
              selectedTabIds.length > 0
                ? activity.tabs.filter((t) =>
                    selectedTabIds.includes(t._id.toString())
                  )
                : activity.tabs;
            return acc.concat(filtered);
          }, []);
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
      let createdActivity;
      let ggbFiles;
      if (body.ggbFiles) {
        ggbFiles = [...body.ggbFiles];
      }
      // mathspace only exists when generated from a replayer state
      if (body.mathState) {
        existingTabs.forEach((tab, i, array) => {
          if (body.mathState[tab._id] && tab.tabType === 'geogebra') {
            array[i].currentStateBase64 = body.mathState[tab._id];
          } else if (body.mathState[tab._id] && tab.tabType === 'desmos') {
            array[i].currentState = body.mathState[tab._id];
          }
        });
      }
      delete body.ggbFiles;
      delete body.activities;
      delete body.tabs;
      delete body.mathState;

      const getCurrentStateBase64 = (tab) => {
        switch (tab.roomType || tab.tabType) {
          case 'desmosActivity':
            return tab.startingPointBase64;
          case 'pyret':
            return tab.desmosLink || tab.currentStateBase64;
          default:
            return tab.currentStateBase64;
        }
      };

      db.Activity.create(body)
        .then(async (activity) => {
          createdActivity = activity;

          if (createdActivity.users.length) {
            await db.User.updateMany(
              { _id: { $in: createdActivity.users } },
              { $addToSet: { activities: createdActivity._id } }
            );
          }

          if (!existingTabs) {
            if (Array.isArray(ggbFiles) && ggbFiles.length > 0) {
              return Promise.all(
                ggbFiles.map((file, index) => {
                  return db.Tab.create({
                    name: `Tab ${index + 1}`,
                    activity: activity._id,
                    ggbFile: file,
                    tabType: body.roomType,
                    creator: body.creator,
                  });
                })
              );
            }
            return db.Tab.create({
              name: 'Tab 1',
              activity: activity._id,
              desmosLink: body.desmosLink,
              tabType: body.roomType,
              creator: body.creator,
              currentStateBase64: getCurrentStateBase64(body),
            });
          }

          return Promise.all(
            existingTabs.map((tab) => {
              const newTab = new db.Tab({
                name: tab.name,
                activity: activity._id,
                ggbFile: tab.ggbFile,
                currentState: tab.currentState,
                startingPoint: tab.currentState,
                startingPointBase64:
                  tab.tabType === 'desmosActivity'
                    ? tab.startingPointBase64
                    : tab.currentStateBase64,
                currentStateBase64: getCurrentStateBase64(tab),
                desmosLink: tab.desmosLink,
                tabType: tab.tabType,
                creator: body.creator,
              });
              return newTab.save();
            })
          );
        })
        .then((tab) => {
          if (Array.isArray(tab)) {
            return db.Activity.findByIdAndUpdate(
              createdActivity._id,
              { $addToSet: { tabs: tab.map((t) => t._id) } },
              { new: true }
            ).populate('tabs');
          }
          return db.Activity.findByIdAndUpdate(
            createdActivity._id,
            { $addToSet: { tabs: tab._id } },
            { new: true }
          ).populate('tabs');
        })
        .then((activity) => {
          resolve(activity);
        })
        .catch((err) => {
          reject(err);
        });
    });
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      if (body.isTrashed) {
        let updatedActivity;
        db.Activity.findById(id)
          .then(async (activity) => {
            activity.isTrashed = true;
            try {
              updatedActivity = await activity.save();
            } catch (err) {
              reject(err);
            }

            if (activity.users.length) {
              await db.User.updateMany(
                { _id: { $in: activity.users } },
                { $pull: { activities: activity._id } }
              );
            }

            if (activity.course) {
              return db.Course.findByIdAndUpdate(activity.course, {
                $pull: { activities: activity._id },
              });
            }

            return resolve(updatedActivity);
            // let userIds = activity.members.map(member => member.user);
            // // Delete this activitiy from any courses
          })
          .then(() => {
            resolve(updatedActivity);
          })
          .catch((err) => reject(err));
      } else {
        db.Activity.findByIdAndUpdate(id, body)
          .then((activity) => resolve(activity))
          .catch((err) => {
            reject(err);
          });
      }
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.Activity.findById(id)
        .then((activity) => {
          activity.remove();
          resolve(activity);
        })
        .catch((err) => reject(err));
    });
  },

  add: async (id, body) => {
    // Send a notification to user that they've been granted access to
    // a new activity, and add the user to the activities users array

    const { ntfType, members } = body;
    const { user: userId } = members;

    const activity = await db.Activity.findByIdAndUpdate(id, {
      $addToSet: { users: userId },
    });
    await db.User.findByIdAndUpdate(userId, { $addToSet: { activities: id } });
    // await db.Notification.create({
    //   resourceType: 'activity',
    //   resourceId: id,
    //   toUser: userId,
    //   notificationType: ntfType,
    //   parentResource: activity.course,
    // });
    return activity.users;
  },

  remove: async (id, body) => {
    const { members } = body;
    const { user: userId } = members;

    // remove the user from the activity's user array
    const activity = await db.Activity.findByIdAndUpdate(id, {
      $pull: { users: userId },
    });

    // remove activity from user's list of activities
    await db.User.findByIdAndUpdate(userId, {
      $pull: { activities: id },
    });

    // @TODO: remove notifications for this activity from user's list of ntfs
    // currently, we do not send ntfs for activities

    return activity.users;
  },

  getAllRooms: (id, { since, isActive }) => {
    const matchConditions = {
      status: { $ne: STATUS.TRASHED },
      isTrashed: false,
      activity: id,
    };

    if (isActive === 'true') {
      matchConditions.status = { $nin: [STATUS.ARCHIVED, STATUS.TRASHED] };
    }

    const sinceTimestamp = moment(since, 'x');
    if (sinceTimestamp.isValid()) {
      matchConditions.updatedAt = { $gte: sinceTimestamp.toDate() };
    }

    return db.Room.find(matchConditions)
      .sort('-createdAt')
      .populate({ path: 'members.user', select: 'username' })
      .populate({ path: 'currentMembers', select: 'username' })
      .populate({
        path: 'tabs',
        select: 'name tabType desmosLink controlledBy',
      });
  },
};
