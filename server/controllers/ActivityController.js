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

  searchPaginated: (criteria, skip, filters) => {
    return db.Activity.find(
      criteria
        ? {
            ...filters,
            $or: [
              { name: criteria },
              { desciprtion: criteria },
              { instructions: criteria },
            ],
            isTrashed: false,
          }
        : { ...filters, isTrashed: false }
    )
      .skip(parseInt(skip, 10))
      .limit(20)
      .populate('creator', 'username')
      .then((activities) => {
        return activities;
      });
  },

  post: (body) => {
    return new Promise(async (resolve, reject) => {
      let existingTabs;
      // This indicates we're copying 1 or more activities
      if (body.activities) {
        // We should save these "SOURCE" activities on the new acitivty so we know where they cam from
        try {
          const activities = await db.Activity.find({
            _id: { $in: body.activities },
          }).populate('tabs');
          existingTabs = activities.reduce((acc, activity) => {
            return acc.concat(activity.tabs);
          }, []);
        } catch (err) {
          reject(err);
        }
      }
      let createdActivity;
      let ggbFiles;
      if (body.ggbFiles) {
        ggbFiles = [...body.ggbFiles];
      }
      delete body.ggbFiles;
      delete body.activities;
      delete body.tabs;
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
                startingPoint: tab.startingPoint,
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
