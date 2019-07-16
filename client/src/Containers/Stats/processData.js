/* eslint-disable no-unused-vars */
// @todo rename utils
export const processData = (data, { users, events, messages, actions }) => {
  const timeScale = calculateTimeScale(
    data[0].timestamp,
    data[data.length - 1].timestamp
  );
  const filteredData = filterData(data, { users, events, messages });
  const lines = filteredData.map(fd => ({
    data: buildLineData(fd.data, timeScale),
    color: fd.color,
  }));
  return {
    lines,
    timeScale,
    units: timeUnitMap[timeScale],
  };
};

const filterData = (data, { users, events, messages = [], actions = [] }) => {
  let dataSets = [];
  // If filtering by two or more users we want the lines on the graph to represent them.
  if (users && users.length > 1) {
    dataSets = users.map(user => {
      const filteredData = data.filter(d => {
        let criteriaMet = false;
        if ((d.user && d.user._id === user) || d.user === user) {
          criteriaMet = true;
          if (messages && messages.length > 0 && d.messageType) {
            const includeUserMessages = messages.indexOf('USER') > -1;
            const includeEntryExitMessages =
              messages.indexOf('ENTER_EXIT') > -1;
            const includeControlMessages = messages.indexOf('CONTROL') > -1;
            criteriaMet =
              (includeUserMessages && d.messageType === 'TEXT') ||
              (includeEntryExitMessages &&
                (d.messageType === 'JOINED_ROOM' ||
                  d.messageType === 'LEFT_ROOM')) ||
              (includeControlMessages &&
                (d.messageType === 'TOOK_CONTROL' ||
                  d.messageType === 'RELAESED_CONTROL'));
          } else if (events && events.length > 0) {
            const includeMessages = events.indexOf('MESSAGES') > -1;
            const includeActions =
              events.indexOf('ACTIONS') > -1 && actions.length === 0;
            criteriaMet =
              (includeMessages && d.messageType) ||
              (includeActions && !d.messageType);
          }
        }
        return criteriaMet;
      });
      if (filteredData.length > 0) {
        return { data: filteredData, color: filteredData[0].color };
      }
      return { data: [], color: null };
    });
  }
  // if we're looking at just one user or all users we want the lines to represent
  // the different event types
  else if (events && events.length > 0) {
    if (users && users.length === 1) {
      data = data.filter(
        d => d.user && (d.user === users[0] || d.user._id === users[0])
      );
    }
    if (messages.length > 0) {
      dataSets = dataSets.concat(
        messages.map(m => {
          return {
            data: data.filter(d => {
              const { messageType: mt } = d;
              if (!mt) return false;
              return (
                (m === 'USER' && mt === 'TEXT') ||
                (m === 'ENTER_EXIT' &&
                  (mt === 'JOINED_ROOM' || mt === 'LEFT_ROOM')) ||
                (m === 'CONTROL' &&
                  (mt === 'TOOK_CONTROL' || mt === 'TOOK_CONTROL'))
              );
            }),
            color: lineColors[m],
          };
        })
      );
    } else if (actions.length > 0) {
      console.log('actions need to be filtered');
    }
    dataSets = dataSets.concat(
      events.map(e => {
        if (e === 'MESSAGES' && messages.length === 0) {
          return {
            data: data.filter(d => d.messageType),
            color: lineColors.MESSAGES,
          };
        }
        if (e === 'ACTIONS' && actions.length === 0) {
          return {
            data: data.filter(d => !d.messageType),
            color: lineColors.ACTIONS,
          };
        }
        return { data: [], color: null };
      })
    );
  } else {
    // figure out users color+*
    if (users && users.length === 1) {
      data = data.filter(
        d => d.user && (d.user === users[0] || d.user._id === users[0])
      );
    }
    dataSets = [{ data, color: users && users[0] ? data[0].color : '#2d91f2' }];
  }
  console.log({ dataSets });
  return dataSets.filter(ds => ds.color);
};

const calculateTimeScale = (start, end) => {
  let timeScale;
  const seconds = (end - start) / 1000;
  if (seconds > 63072000) {
    timeScale = 31536000; // Yeear
  } else if (seconds > 5184000) {
    timeScale = 2592000; // 30 Days
  } else if (seconds > 1209600) {
    timeScale = 604800; // Week
  } else if (seconds > 172800) {
    timeScale = 86400; // Day
  } else if (seconds > 7200) {
    timeScale = 3600; // hour
  } else if (seconds > 120) {
    timeScale = 60; // minute
  } else {
    timeScale = 1; // @todo consider putting in 10s increments
  }
  return timeScale;
};

const buildLineData = (data, timeScale) => {
  let timeElapsed = 0; // seconds
  let eventCount = 0;
  let startTime = 0;
  const processedData = [];
  // combine events by timeScale -- i.e. get the number of events that happened between start and end of timeScale unit
  data.forEach((datum, i) => {
    if (data[i - 1]) {
      eventCount += 1;
      const timeToAdd = (datum.timestamp - data[i - 1].timestamp) / 1000; // in seconds
      timeElapsed += timeToAdd;
      if (timeElapsed >= timeScale) {
        if (startTime === 0) {
          processedData.push([0.1, eventCount]);
        } else {
          processedData.push([startTime, eventCount]);
        }
        const skips = Math.floor(timeElapsed / timeScale);
        // startTime += 1;
        for (i = 0; i < skips * 4; i++) {
          startTime += 0.25;
          processedData.push([startTime - 0.1, 0]);
        }
        timeElapsed = 0;
        eventCount = 0;
      } else if (i === data.length - 1) {
        processedData.push([startTime, eventCount]);
      }
    }
  });
  processedData.unshift([0, 0]);
  processedData.push([startTime + 0.1, 0]);
  return processedData;
};

export const timeUnitMap = {
  31536000: 'years',
  2592000: 'months',
  604800: 'weeks',
  86400: 'days',
  3600: 'hours',
  60: 'minutes',
  1: 'seconds',
};

export const dateFormatMap = {
  years: 'MM/DD/YYYY',
  months: 'MM/DD/YYYY',
  weeks: 'MM/DD/YYYY',
  days: 'MM/DD/YYYY h:mm',
  hours: 'h:mm:ss A',
  minutes: 'h:mm:ss A',
  seconds: 'h:mm:ss A',
};

export const lineColors = {
  MESSAGES: '#5dd74a',
  ACTIONS: '#8d4adb',
  ENTER_EXIT: '#4655d4',
  CONTROL: '#c940ce',
  USER: '#43c086',
  redorange: '#fb4b02',
  orange: '#ff8d14',
  lime: '#94e839',
  red: '#cf2418',
};
