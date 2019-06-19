const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
const Tab = new mongoose.Schema({
  name: { type: String },
  appName: { type: String, enum: ['3d', 'graphing', 'classic', 'geometry'] }, // Only for GeoGebra Rooms
  instructions: { type: String },
  tabType: { type: String, enum: ['geogebra', 'desmos'] },
  currentState: { type: String, default: '' },
  ggbFile: { type: String }, // ggb base64 file
  desmosLink: { type: String },
  perspective: {
    type: String,
    default: 'AD', //https://wiki.geogebra.org/en/SetPerspective_Command
    validate: {
      validator: function(v) {
        let regex = /[ABCDGLST]/g;
        return regex.test(v);
      },
      message: props => `${props.value} is not a valide perspective`,
    },
  },
  events: { type: [{ type: ObjectId, ref: 'Event', _id: false }], default: [] },
  room: { type: ObjectId, ref: 'Room' },
  activity: { type: ObjectId, ref: 'Activity' },
  startingPoint: { type: String, default: ' ' }, // string with a space so its truthy
  sequenceNo: { type: Number },
  controlledBy: { type: ObjectId, ref: 'User', default: null },
  creator: { type: ObjectId, ref: 'User' },
  isTrashed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Tab', Tab);
