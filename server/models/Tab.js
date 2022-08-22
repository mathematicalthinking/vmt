const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;
const Tab = new mongoose.Schema(
  {
    name: { type: String },
    appName: { type: String, enum: ['3d', 'graphing', 'classic', 'geometry'] }, // Only for GeoGebra Rooms
    instructions: { type: String },
    tabType: { type: String, enum: ['geogebra', 'desmos', 'desmosActivity', 'pyret', 'wsp'] },
    currentState: { type: String, default: '' },
    currentStateBase64: { type: String, default: '' },
    currentScreen: { type: Number, default: 0 },
    ggbFile: { type: String }, // ggb base64 file
    desmosLink: { type: String },
    perspective: {
      type: String,
      default: 'AD', // https://wiki.geogebra.org/en/SetPerspective_Command
      validate: {
        validator(v) {
          const regex = /[ABCDGLST]/g;
          return regex.test(v);
        },
        message: (props) => `${props.value} is not a valid perspective`,
      },
    },
    events: {
      type: [{ type: ObjectId, ref: 'Event', _id: false }],
      default: [],
    },
    room: { type: ObjectId, ref: 'Room' },
    activity: { type: ObjectId, ref: 'Activity' },
    startingPoint: { type: String, default: '' },
    startingPointBase64: { type: String, default: '' },
    sequenceNo: { type: Number },
    controlledBy: { type: ObjectId, ref: 'User', default: null },
    creator: { type: ObjectId, ref: 'User' },
    isTrashed: { type: Boolean, default: false },
    visitors: [{ type: ObjectId, ref: 'User' }], // unique list of users who have viewed this tab
    visitorsSinceInstructionsUpdated: [{ type: ObjectId, ref: 'User' }], // used to determine if should show instructions modal; reset every time instructions have been updated
    snapshot: {},
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tab', Tab);
