import moment from 'moment';

export function getEventType(event) {
  if (event.ggbEvent && typeof event.ggbEvent.eventType === 'string') {
    return event.ggbEvent.eventType;
  }
  return event.eventType;
}

export function getEventLabel(event) {
  if (event.ggbEvent && typeof event.ggbEvent.label === 'string') {
    return event.ggbEvent.label;
  }
  return event.label;
}

export function getEventXml(event) {
  if (event.ggbEvent && typeof event.ggbEvent.xml === 'string') {
    return event.ggbEvent.xml;
  }
  return event.event;
}

export function setEventXml(event, xmlOrGgbEvent) {
  const isNewEvent =
    event.ggbEvent && typeof event.ggbEvent.eventType === 'string';

  const xml =
    typeof xmlOrGgbEvent === 'string' ? xmlOrGgbEvent : xmlOrGgbEvent.xml;

  if (isNewEvent) {
    event.ggbEvent.xml = xml;
  } else {
    event.event = xml;
  }
}

export function setEventType(event, eventType) {
  const isNewEvent =
    event.ggbEvent && typeof event.ggbEvent.eventType === 'string';

  if (isNewEvent) {
    event.ggbEvent.eventType = eventType;
  } else {
    event.eventType = eventType;
  }
}

export default (log, tabs) => {
  const BREAK_DURATION = 2000;
  const MAX_WAIT = 10000; // 10 seconds
  const updatedLog = [];
  let endTime;
  const relativeDuration = log.reduce((acc, cur, idx, src) => {
    // Copy currentEvent
    const event = { ...cur };
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
    const eventType = getEventType(event);
    if (eventType === 'REMOVE') {
      let eventsToFind;
      let undoXML = '';
      let undoArray = [];

      const label = getEventLabel(event);

      const { eventArray } = event;
      if (eventArray && eventArray.length > 1) {
        eventsToFind = [...eventArray];
      } else eventsToFind = [label];
      // go back through all of the previous events
      for (let i = idx - 1; i >= 0; i--) {
        const srcEventType = getEventType(src[i]);
        if (srcEventType === 'ADD' || srcEventType === 'BATCH_ADD') {
          // If the event has an event array, look through it for eventsToFind
          if (src[i].eventArray && src[i].eventArray.length > 0) {
            undoArray = undoArray.concat(
              src[i].eventArray.filter((e) => {
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
            getEventLabel(src[i]) &&
            eventsToFind.indexOf(getEventLabel(src[i]))
          ) {
            const index = eventsToFind.indexOf(getEventLabel(src[i]));
            eventsToFind.splice(index, 1);
            undoXML += getEventXml(src[i]);
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
