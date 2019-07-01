import moment from 'moment';

export const buildLog = (log, tabs) => {
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
    if (event.eventType === 'REMOVE') {
      console.log('this is a remove event');
      console.log(event.eventArray);
      console.log(event.label);
      const { label } = event;
      //   if (eventArray && eventArray.length > 1) {
      //       eventArray
      //   }
      for (let i = idx - 1; i >= 0; i--) {
        if (
          label === src[i].label &&
          (src[i].eventType === 'ADD' || src[i].eventType === 'BATCH_ADD')
        ) {
          console.log('this is its corresponding event');
          console.log(src[i]);
          event.undoXML = src[i].event;
          break;
        }
      }
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

export const something = function() {};
