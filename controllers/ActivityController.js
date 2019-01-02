const db = require('../models')

module.exports = {
  get: (params) => {
    return new Promise((resolve, reject) => {
      db.Activity.find(params).populate('tabs')
      .then(activities => {resolve(activities)})
      .catch(err => reject(err));
    });
  },

  getById: (id) => {
    return new Promise((resolve, reject) => {
      db.Activity.findById(id).populate('tabs')
      .then(activity => resolve(activity))
      .catch(err => reject(err))
    });
  },

  post: (body) => {
    return new Promise(async (resolve, reject) => {
      let existingTabs;
      if (body.activities) {
        try {
          let activities = await db.Activity.find({'_id': {$in: body.activities}}).populate('tabs')
          existingTabs = activities.reduce((acc, activity) => {
            return acc.concat(activity.tabs)
          }, [])
        }
        catch(err) {reject(err)}
      }
      let createdActivity;
      let ggbFiles = [...body.ggbFiles];
      delete body.ggbFiles;

      db.Activity.create(body)
      .then(activity => {
        createdActivity = activity;

        if (!existingTabs) {
          if (Array.isArray(ggbFiles) && ggbFiles.length > 0) {
            return Promise.all(ggbFiles.map((file, index) => {
              return db.Tab.create({
                name: `Tab ${index + 1}`,
                activity: activity._id,
                ggbFile: file,
                tabType: body.roomType,
              })
            }))
          } else {
            return db.Tab.create({
              name: 'Tab 1',
              activity: activity._id,
              desmosLink: body.desmosLink,
              tabType: body.roomType,
            })
          }
        } else {
          return Promise.all(existingTabs.map(tab => {
            delete tab._id
            tab.activity = activity._id;
            tab.startingPoint = tab.currentState;
            return db.Tab.create(tab)
          }))
        }
      })
      .then(tab => {
        if (Array.isArray(tab)) {
          return db.Activity.findByIdAndUpdate(createdActivity._id, {$addToSet: {tabs: tab.map(tab => tab._id)}}, {new: true})
        }
        return db.Activity.findByIdAndUpdate(createdActivity._id, {$addToSet: {tabs: tab._id}}, {new: true})})
      .then(activity => {resolve(activity)})
      .catch(err => {reject(err)})
    })
  },

  put: (id, body) => {
    return new Promise((resolve, reject) => {
      if (body.isTrashed) {
        let updatedActivity
        db.Activity.findByIdAndUpdate(id, body, {new: true})
        .then(activity => {
          updatedActivity = activity;
          // @TODO HOW SHOULD WE CLEAN THIS UP ? SHOULD ROOMS CREATED FROM IT HAVE THEIR ACTIVITY FIELD SET TO NULL
          if (activity.course) {
            return db.Course.findByIdAndUpdate(activity.course, {$pull: {activities: activity._id}})
          } else resolve(updatedActivity)
          // let userIds = activity.members.map(member => member.user);
          // // Delete this activitiy from any courses
        })
        .then(() => {
          resolve(updatedActivity)
        })
        .catch(err => reject(err))
      } else {
        db.Activity.findByIdAndUpdate(id, body)
        .then(activity => resolve(activity))
        .catch(err => reject(err))
      }
    })
  },

  delete: id => {
    return new Promise((resolve, reject) => {
      db.Activity.findById(id)
      .then(activity => {
        activity.remove()
        resolve(activity)})
      .catch(err => reject(err))
    })
  }

}
