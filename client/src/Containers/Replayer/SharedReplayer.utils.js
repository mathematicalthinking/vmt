import moment from 'moment';
import { property } from 'lodash';

const getGgbEventType = property('ggbEvent.eventType');
const getGgbEventArray = property('ggbEvent.eventArray');
const getGgbEventLabel = property('ggbEvent.label');

export default (log, tabs) => {
  const BREAK_DURATION = 2000;
  const MAX_WAIT = 10000; // 10 seconds
  const updatedLog = [];
  let endTime;
  const relativeDuration = log.reduce((acc, cur, idx, src) => {
    // Copy currentEvent
    const event = { ...cur };

    const ggbEventType = getGgbEventType(event);

    // Add the relative Time
    event.relTime = acc;
    // ADD A TAB FOR EVENTS THAT DONT ALREADY HAVE THEM TO MAKE SKIPPING AROUND EASIER
    if (!event.tab) {
      // when would we ever have an event without a tab ID ? // is this so it works with old data before we had tabs?
      if (!src[idx - 1]) {
        // IF this is the first event give it the starting tab
        event.tab = tabs[0]._id;
      } else {
        event.tab = updatedLog[updatedLog.length - 1].tab; // Else give it the same tabId as the event before
      }
    }

    // to undo a remove event we need to get the xml from when that event was created
    // when shapes, points etc. are batch removed we need to potentially find multiple events
    // and when shapes etc are batch created we need to potentially extract one element from
    // the event array...or potentially a combination of both of theses things
    // to manage this we define Array eventsToFind which we mutate
    // eventsToFind so that if it is empty we know we've found all of the relevant events
    if (ggbEventType === 'REMOVE') {
      let eventsToFind;
      let undoXML = '';
      let undoArray = [];
      const { label, eventArray } = event.ggbEvent;
      if (eventArray && eventArray.length > 1) {
        eventsToFind = [...eventArray];
      } else eventsToFind = [label];
      // go back through all of the previous events
      for (let i = idx - 1; i >= 0; i--) {
        if (
          getGgbEventType(src[i]) === 'ADD' ||
          getGgbEventType(src[i]) === 'BATCH_ADD'
        ) {
          const evArray = getGgbEventArray(src[i]);

          // If the event has an event array, look through it for eventsToFind
          if (evArray && evArray.length > 0) {
            undoArray = undoArray.concat(
              evArray.filter((e) => {
                let found = false;
                const eSlice = e.slice(0, e.indexOf(':'));
                eventsToFind.forEach((etf) => {
                  if (eSlice.indexOf(etf)) {
                    found = true;
                  }
                });
                return found;
              })
            );
          } else if (
            getGgbEventLabel(src[i]) &&
            eventsToFind.indexOf(getGgbEventLabel(src[i]))
          ) {
            const index = eventsToFind.indexOf(getGgbEventLabel(src[i]));
            eventsToFind.splice(index, 1);
            undoXML += src[i].event;
          }
          if (eventsToFind.length === 0) {
            break;
          }
        }
      }
      event.undoXML = undoXML;
      event.undoArray = undoArray;
    }

    updatedLog.push(event);
    // calculate the next time
    if (src[idx + 1]) {
      const diff = src[idx + 1].timestamp - cur.timestamp;
      if (diff < MAX_WAIT) {
        acc += diff;
        return acc;
      }
      updatedLog.push({
        synthetic: true,
        message: `No activity ... skipping ahead to ${moment
          .unix(src[idx + 1].timestamp / 1000)
          .format('MM/DD/YYYY h:mm:ss A')}`,
        relTime: (acc += BREAK_DURATION),
        tab: updatedLog[updatedLog.length - 1].tab,
      });
      acc += BREAK_DURATION;
      return acc;
    }
    return acc;
  }, 0);
  return {
    relativeDuration,
    endTime,
    updatedLog,
  };
};
