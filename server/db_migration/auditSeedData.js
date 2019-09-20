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

function findTabsWithBadActivity() {
  return Models.Tab.find({ activity: { $ne: null } })
    .populate('activity')
    .then((tabs) => {
      return tabs.map((tab) => {
        const hasBadActivity = !tab.activity;
        if (hasBadActivity) {
          console.log(`Tab ${tab._id} has bad activity`);
        }
        return tabs;
      });
    });
}

findBadTabs();
findTabsWithBadActivity();
