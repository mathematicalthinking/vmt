const mongoose = require('mongoose');

const { ObjectId } = mongoose.Schema.Types;
const Tab = require('./Tab.js');
const Message = require('./Message');

const ggbEvent = {
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
      'MODE',
      'TOGGLE',
      'UPDATE_TEXT_FIELD',
    ],
  },
  oldLabel: { type: String }, // used for RENAME events,
  base64: { type: String }, // additional files such as images get lost using xml,
  caption: { type: String }, // used to build description for certain objects; e.g. checkboxes with a label (diff from ggb object label)
  originalValueString: { type: String },
};
const Event = new mongoose.Schema({
  user: { type: ObjectId, ref: 'User' },
  ggbEvent,
  eventArray: [ggbEvent],
  description: { type: String },
  currentState: { type: String }, // DESMOS ONLY...@todo some validation for this
  room: { type: ObjectId, ref: 'Room', required: true },
  tab: { type: ObjectId, ref: 'Tab', required: true },
  color: { type: String },
  isMultiPart: { type: Boolean, default: false },
  timestamp: { type: Number, required: true }, // UNIX TIME but in MS
  isTrashed: { type: Boolean, default: false },
});

Event.index({ room: 1 });
Event.index({ user: 1 });
Event.index({ tab: 1 });

Event.pre('save', async function() {
  // tabs[this.tabIndex].events.push(this._id)
  try {
    this.timestamp = Date.now();
    await Tab.findByIdAndUpdate(this.tab, { $addToSet: { events: this._id } });
  } catch (err) {
    console.error(err);
  }
});

Event.post('save', async function(event) {
  try {
    const { ggbEvent, tab, eventArray } = event;

    if (ggbEvent || Array.isArray(eventArray)) {
      const events =
        Array.isArray(eventArray) && eventArray.length > 0
          ? eventArray
          : [ggbEvent];

      const { eventType } = events[0];

      const mutateEvents = ['DRAG', 'REMOVE', 'RENAME', 'UPDATE_STYLE'];

      if (mutateEvents.includes(eventType)) {
        const labels = [...events].reduce((results, event) => {
          if (typeof event.label === 'string') {
            if (eventType === 'RENAME') {
              results.push([event.oldLabel, event.label]);
            } else {
              results.push(event.label);
            }
          }
          return results;
        }, []);

        if (labels.length === 0) {
          return;
        }

        if (eventType === 'REMOVE') {
          // check if there are references for this event's tab
          // that reference the element being removed and that do
          // not already refer to a removed element

          const criteria = {
            'reference.tab': tab,
            'reference.wasObjectDeleted': { $ne: true },
            'reference.element': { $in: labels },
          };

          const update = { $set: { 'reference.wasObjectDeleted': true } };

          const removeUpdateResults = await Message.updateMany(
            criteria,
            update
          ).exec();

          console.log({ removeUpdateResults });
        } else if (eventType === 'DRAG' || eventType === 'UPDATE_STYLE') {
          const criteria = {
            'reference.tab': tab,
            'reference.wasObjectUpdated': { $ne: true },
            'reference.element': { $in: labels },
          };

          const update = { $set: { 'reference.wasObjectUpdated': true } };

          const modifiedUpdateResults = await Message.updateMany(
            criteria,
            update
          ).exec();

          console.log({ modifiedUpdateResults });
        } else if (eventType === 'RENAME') {
          // only one object renamed at a time

          const updatedMessages = labels.map((labels) => {
            const [oldLabel, newLabel] = labels;
            const criteria = {
              'reference.tab': tab,
              'reference.element': oldLabel,
            };

            return Message.findOne(criteria)
              .then((message) => {
                if (!message) {
                  return null;
                }
                const { reference } = message;

                let doSave = false;

                if (reference.element === oldLabel) {
                  message.reference.wasObjectUpdated = true;
                  message.reference.element = newLabel;
                  doSave = true;
                }
                return doSave ? message.save() : message;
              })
              .catch((err) => {
                throw err;
              });
          });

          await Promise.all(updatedMessages);
          console.log({ updatedMessages });
        }
      }
    }
  } catch (err) {
    console.log(`Error Event post save: ${err} `);
  }
});

module.exports = mongoose.model('Event', Event);
