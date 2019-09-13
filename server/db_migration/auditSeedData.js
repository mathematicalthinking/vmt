const mongoose = require('mongoose');
const Models = require('../models');

mongoose.connect(`mongodb://localhost/vmt-test`);

function findBadTabs() {
  return Models.Activity.find({ tabs: { $ne: [] } })
    .populate('tabs')
    .then((activities) => {
      return activities.map((activity) => {
        const hasBadTabs =
          activity.tabs.length === 0 ||
          activity.tabs.filter((t) => !t).length > 0;
        if (hasBadTabs) {
          console.log(`activity ${activity._id} has bad tabs`);
        }
        return activity;
      });
    });
}

findBadTabs();
