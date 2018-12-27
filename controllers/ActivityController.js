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
    console.log("BODY: ", body)
    return new Promise(async (resolve, reject) => {
      let existingTabs;
      if (body.activities) {
        try {
          let activities = await db.Activity.find({'_id': {$in: [body.activities]}}).populate('tabs')
          existingTabs = activities.reduce((acc, activity) => {
            console.log("A.T: ", activity.tabs)
            return acc.concat(activity.tabs)
          }, [])
          console.log("A: ", activities)
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
          console.log("EXISTING TABS: ", existingTabs)
          return Promise.all(existingTabs.map(tab => {
            let newTab = {...tab}
            delete newTab._id;
            newTab.activity = activity._id;
            return db.Tab.create(newTab)
          }))
        }
      })
      .then(tab => {
        console.log("TABS: ", tab)
        return db.Activity.findByIdAndUpdate(createdActivity._id, {
          $addToSet: {tabs: Array.isArray(tab) ? {$each: tab.map(t => t._id)} : tab._id}
        }, {new: true}).populate({path: 'tabs'})
      })
      .then(activity => {
        console.log("ACTIVITY: ", activity)
        resolve(activity)
      })
      .catch(err => {
        console.log(err)
        reject(err)
      })
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
