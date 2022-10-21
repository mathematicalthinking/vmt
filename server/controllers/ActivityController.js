const db = require('../models');

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
      db.Activity.findById(id)
        .populate('tabs')
        .then((activity) => resolve(activity))
        .catch((err) => reject(err));
    });
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
      { $unwind: '$creatorObject' },
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
          creator: { $first: '$creatorObject' },
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
          'creator.username': '$creator.username',
          'creator._id': '$creator._id',
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
    const activities = await db.Activity.aggregate(aggregationPipeline);
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

      db.Activity.create(body)
        .then((activity) => {
          createdActivity = activity;
          if (!existingTabs) {
            if (Array.isArray(ggbFiles) && ggbFiles.length > 0) {
              return Promise.all(
                ggbFiles.map((file, index) => {
                  return db.Tab.create({
                    name: `Tab ${index + 1}`,
                    activity: activity._id,
                    ggbFile: file,
                    tabType: body.roomType,
                  });
                })
              );
            }
            return db.Tab.create({
              name: 'Tab 1',
              activity: activity._id,
              desmosLink: body.desmosLink,
              tabType: body.roomType,
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
                currentStateBase64:
                  tab.tabType === 'desmosActivity'
                    ? tab.startingPointBase64
                    : tab.currentStateBase64,
                desmosLink: tab.desmosLink,
                tabType: tab.tabType,
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
          .catch((err) => reject(err));
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
};
