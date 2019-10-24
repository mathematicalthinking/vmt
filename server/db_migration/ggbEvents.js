/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const { parseString } = require('xml2js');
const Models = require('../models');

mongoose.connect(`mongodb://localhost/vmt`, { useNewUrlParser: true });

const parseXML = (xml) => {
  return new Promise((resolve, reject) => {
    parseString(xml, (err, result) => {
      if (err) return reject(err);
      return resolve(result);
    });
  });
};

const handleCounts = (hash, prop) => {
  hash[prop] = hash[prop] ? hash[prop] + 1 : 1;
};

const parseAddObjTypeFromDescription = (description) => {
  if (typeof description !== 'string') {
    return '';
  }

  const split = description.split(' ');
  // format should always be [username] [verb] [objType] [label]

  return split[2];
};

const parseElementXml = (xml) => {
  let objType;
  let label;

  const typeIx = xml.indexOf('type="');

  if (typeIx >= 0) {
    const firstQuoteIx = typeIx + 5;
    const closeQuoteIx =
      firstQuoteIx + xml.slice(firstQuoteIx + 1).indexOf('"');
    objType = xml.slice(firstQuoteIx + 1, closeQuoteIx + 1);
  }

  const labelIx = xml.indexOf('label="');

  if (labelIx >= 0) {
    const firstQuoteIx = labelIx + 6;
    const closeQuoteIx =
      firstQuoteIx + xml.slice(firstQuoteIx + 1).indexOf('"');
    label = xml.slice(firstQuoteIx + 1, closeQuoteIx + 1);
  }
  return [objType, label];
};

async function migrateOldGeogebraEvents() {
  try {
    const eventTypeCounts = {};
    const selectActionCounts = {};
    const selectDefinitionCounts = {};

    const addActionCounts = {};
    const addObjectTypes = {};

    const batchAddActionCounts = {};

    const batchUpdateObjTypes = {};

    const events = await Models.Event.find({
      eventType: { $type: 'string' },
    }).exec();

    // eslint-disable-next-line no-unused-vars
    const updatedEvents = events.map(async (event) => {
      const copy = event.toObject();
      const { eventType } = copy;

      // const ggbEvent = {};
      // const ggbEventArray = [];

      handleCounts(eventTypeCounts, eventType);

      if (eventType === 'SELECT') {
        // action = mode or ggbObj
        const { action, label, definition } = copy;

        handleCounts(selectActionCounts, action);
        handleCounts(selectDefinitionCounts, definition);

        const selectType = action === 'mode' ? 'MODE' : 'SELECT';

        if (selectType === 'SELECT') {
          const ggbEvent = {
            label,
            eventType: 'SELECT',
            objType: definition,
          };
          copy.ggbEvent = ggbEvent;
          copy.eventArray = [];
        } else {
          const ggbEvent = {
            label,
            eventType: 'MODE',
          };

          copy.ggbEvent = ggbEvent;
          copy.eventArray = [];
        }
      } else if (eventType === 'ADD') {
        const { action, label, event, definition } = copy;
        handleCounts(addActionCounts, action);

        // action: added, updated, or removed
        // updated is always DRAG, but just a single event not event array

        // const ggbEvent = {
        //   label,
        //   eventType: 'ADD',
        // };

        const objType = parseAddObjTypeFromDescription(copy.description);
        handleCounts(addObjectTypes, objType);

        if (action === 'added') {
          const ggbEvent = {
            label,
            eventType: 'ADD',
            xml: event,
            commandString: definition,
            objType,
          };
          copy.ggbEvent = ggbEvent;
          copy.eventArray = [];
        } else if (action === 'updated') {
          const ggbEvent = {
            label,
            eventType: 'DRAG',
            xml: event,
            objType,
          };

          copy.eventArray = [ggbEvent];
        } else if (action === 'removed') {
          const ggbEvent = {
            label,
            eventType: 'REMOVE',
          };
          copy.ggbEvent = ggbEvent;
          copy.eventArray = [];
          // all of these events do not give any information
          // about the typeof object removed ...
        }

        // return updatedEvent.save();
      } else if (eventType === 'REMOVE') {
        // none of these 9 events have info about the object type
        // have an event array of 1 el that is just the label
        const { label } = copy;
        const ggbEvent = {
          label,
          eventType,
        };

        copy.ggbEvent = ggbEvent;
        copy.eventArray = [];
      } else if (eventType === 'BATCH_ADD') {
        // event array is array of command strings
        // the event prop on the top level event is
        // not accurate
        const { eventArray, action } = copy;

        handleCounts(batchAddActionCounts, action);

        copy.eventArray = eventArray.map((labelCommandString) => {
          // e.g. t1:Polygon(A,B,C);
          const joined = Object.values(labelCommandString).join('');
          const isXML = joined.charAt(0) === '<';

          if (isXML) {
            const elementTypeEndIx = joined.indexOf('>');

            const elementTypeStr = joined.slice(0, elementTypeEndIx);

            const [objType, label] = parseElementXml(elementTypeStr);

            return {
              eventType: action === 'added' ? 'ADD' : 'REMOVE',
              xml: joined,
              objType,
              label,
            };
          }
          const split = joined.split(':');
          // eslint-disable-next-line prefer-const
          let [label, commandString] = split;

          let objType;
          if (commandString === '' || commandString === 'null') {
            commandString = undefined;
          }

          if (commandString) {
            if (commandString.indexOf('(') >= 0) {
              const commandStringSplit = commandString.split('(');
              objType = commandStringSplit[0].toLowerCase();
            }
          }

          return {
            eventType: action === 'added' ? 'ADD' : 'REMOVE',
            label,
            commandString,
            objType,
          };
        });

        // console.log('copy batch add earr', copy.eventArray);
      } else if (eventType === 'BATCH_UPDATE') {
        const { eventArray } = copy;
        copy.eventArray = eventArray.map((xmlString) => {
          const joined = Object.values(xmlString).join('');

          const elementTypeEndIx = joined.indexOf('>');

          const elementTypeStr = joined.slice(0, elementTypeEndIx);

          const [objType, label] = parseElementXml(elementTypeStr);

          handleCounts(batchUpdateObjTypes, objType);

          return {
            eventType: 'DRAG',
            xml: joined,
            objType,
            label,
          };
        });
      } else if (eventType === 'UPDATE_STYLE') {
        const { event } = copy;

        const elementTypeEndIx = event.indexOf('>');

        const elementTypeStr = event.slice(0, elementTypeEndIx);

        const [objType, label] = parseElementXml(elementTypeStr);

        const ggbEvent = {
          xml: event,
          objType,
          label,
          eventType,
        };

        copy.ggbEvent = ggbEvent;

        copy.eventArray = [];
      } else if (eventType === 'UNDO') {
        // 8 events that have no useful information besides eventType
        const ggbEvent = {
          eventType,
        };

        copy.ggbEvent = ggbEvent;
      }

      const updatedEvent = new Models.Event(copy);
      const $update = {
        $set: {
          ggbEvent: updatedEvent.ggbEvent,
          eventArray: updatedEvent.eventArray || [],
        },
        // $unset: {
        //   definition: '',
        //   action: '',
        //   eventType: '',
        //   label: '',
        //   event: '',
        // },
      };

      // return Models.Event.findByIdAndUpdate(copy._id, $update);

      const doc = await Models.Event.findById(updatedEvent._id);

      if (copy.ggbEvent) {
        // console.log({ ggbEvent: copy.ggbEvent });
        doc.ggbEvent = copy.ggbEvent;
      }
      doc.eventArray = copy.eventArray || [];
      return doc.save();
      // return updatedEvent;
      // const overwritten = oldDoc.overwrite(updatedEvent);
      // return Models.Event.replaceOne({ _id: copy._id }, updatedEvent);
    });
    await Promise.all(updatedEvents);

    console.log({ eventTypeCounts });
    console.log({ selectActionCounts });
    console.log({ selectDefinitionCounts });
    console.log({ addActionCounts });
    console.log({ addObjectTypes });
    console.log({ batchAddActionCounts });
    console.log({ batchUpdateObjTypes });

    mongoose.connection.close();
  } catch (err) {
    console.log(`Error migrating events: `, err);
    mongoose.connection.close();
  }
}

migrateOldGeogebraEvents();
