/* eslint-disable no-unused-vars */
// @todo rename utils
export const processData = (data, { users, events, messages, actions }) => {
  const timeScale = calculateTimeScale(
    data[0].timestamp,
    data[data.length - 1].timestamp
  );
  const filteredData = filterData(data, { users, events });
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

const filterData = (data, { users, events, messages, actions }) => {
  let dataSets;
  // If filtering by two or more users we want the lines on the graph to represent them.
  // But if we're looking at just one user or all users we want the lines to represent
  // the different event types
  if (users && users.length > 0) {
    dataSets = users.map(user => {
      const filteredData = data.filter(d => {
        let criteriaMet = false;
        if ((d.user && d.user._id === user) || d.user === user) {
          criteriaMet = true;
          if (events && events.length > 0) {
            const includeMessages = events.indexOf('MESSAGES') > -1;
            const includeActions = events.indexOf('ACTIONS') > -1;
            criteriaMet =
              (includeMessages && d.messageType) ||
              (includeActions && !d.messageType);
          }
        }
        return criteriaMet;
      });
      return { data: filteredData, color: filteredData[0].color };
    });
  } else if (events && events.length > 0) {
    dataSets = events.map(e => {
      if (e === 'MESSAGES') {
        return {
          data: data.filter(d => d.messageType),
          color: lineColors.MESSAGES,
        };
      }
      if (e === 'ACTIONS') {
        return {
          data: data.filter(d => !d.messageType),
          color: lineColors.ACTIONS,
        };
      }
      return null;
    });
  } else {
    console.log({ user: users[0] });
    dataSets = [{ data, color: users && users[0] ? data[0].color : '#2d91f2' }];
  }
  return dataSets;
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
  blue: '#4655d4',
  redorange: '#fb4b02',
  violet: '#c940ce',
  orange: '#ff8d14',
  lime: '#94e839',
  aqua: '#43c086',
  red: '#cf2418',
};
