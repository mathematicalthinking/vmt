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
      db.Activity.create(body)
      .then(activity => {
        createdActivity = activity;
        if (!existingTabs) {
          return db.Tab.create({
            name: 'Tab 1',
            activity: activity._id,
            desmosLink: body.desmosLink,
            ggbFile: body.ggbFile,
            tabType: body.roomType,
          })
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
      db.Activity.findByIdAndUpdate(id, body)
      .then(activity => resolve(activity))
      .catch(err => reject(err))
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
