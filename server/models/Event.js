const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;
const Tab = require('./Tab.js');

const Event = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User' },
  ggbEvent: {
    xml: { type: String },
    coords: { x: { type: Number }, y: { type: Number } },
    commandString: { type: String },
    valueString: { type: String },
    label: { type: String },
    objType: { type: String },
    editorState: { type: String },
    eventType: {
      type: String,
      enum: [
        'ADD',
        'REMOVE',
        'DRAG',
        'RENAME',
        'UPDATE_STYLE',
        'CHANGE_PERSPECTIVE',
        'NEW_TAB',
        'SELECT',
        'UNDO',
        'REDO',
      ],
    },
  },
  eventArray: [{ type: String }], // array of ffb events
  description: { type: String }, // e,g, "Michael added point A"
  currentState: { type: String }, // DESMOS ONLY...@todo some validation for this
  room: { type: ObjectId, ref: 'Room', required: true },
  tab: { type: ObjectId, ref: 'Tab', required: true },
  color: { type: String },
  isMultiPart: { type: Boolean, default: false },
  timestamp: { type: Number, required: true }, // UNIX TIME but in MS
  isTrashed: { type: Boolean, default: false },
});

Event.pre('save', async function() {
  // tabs[this.tabIndex].events.push(this._id)
  try {
    await Tab.findByIdAndUpdate(this.tab, { $addToSet: { events: this._id } });
  } catch (err) {
    console.error(err);
  }
});

module.exports = mongoose.model('Event', Event);
