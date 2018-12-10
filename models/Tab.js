const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Tab = new mongoose.Schema({
  name: {type: String},
  instructions: {type: String},
  tabType: {type: String, enum: ['geogebra', 'desmos']},
  currentState: {type: String, default: ''},
  ggbFile: {type: String}, // ggb base64 file
  desmosLink: {type: String, },
  events: {type: [{type: ObjectId, ref: 'Event', _id: false}], default: []},
  room: {type: ObjectId, ref: 'Room', required: true},
  sequenceNo: {type: Number},
  controlledBy: {type: ObjectId, ref: 'User', default: null}
});

module.exports = mongoose.model('Tab', Tab);
