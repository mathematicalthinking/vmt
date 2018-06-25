const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Tab = new mongoose.Schema({
  tabName: {type: String},
  description: {type: String},
  tabType: {type: String},
  tabFile: {},
  room: {type: ObjectId, ref: 'Room'},
  eventsKey: {},
});

module.exports = mongoose.model('Tab', Tab);
