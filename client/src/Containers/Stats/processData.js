/* eslint-disable no-unused-vars */
// @todo rename utils
export const processData = (data, { users, events, messages, actions }) => {
  let lines;
  const timeScale = calculateTimeScale(
    data[0].timestamp,
    data[data.length - 1].timestamp
  );
  // data = data.filter()
  if (users && users.length > 0) {
    lines = users.map(user => buildLineData(data, timeScale, { user }));
  } else if (events && events.length > 0) {
    lines = events.map(event => buildLineData(data, timeScale, { event }));
  } else {
    lines = buildLineData(data, timeScale, {});
    lines = [lines];
  }
  return {
    lines,
    timeScale,
    units: timeUnitMap[timeScale],
  };
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

const buildLineData = (data, timeScale, { user, event, message, action }) => {
  let timeElapsed = 0; // seconds
  let eventCount = 0;
  let startTime = 0;
  let color = '#2d91f2';
  const processedData = [];
  if (user) {
    data = data.filter(d =>
      d.user ? d.user._id === user || d.user === user : false
    );
    [{ color }] = data;
  }
  console.log('building line daya: ', event);
  if (event === 'MESSAGES') {
    data = data.filter(d => d.messageType);
    color = lineColors.MESSAGES;
  } else if (event === 'ACTIONS') {
    console.log(event === 'ACTIONS');
    data = data.filter(d => !d.messageType);
    color = lineColors.ACTIONS;
  }
  console.log(data);
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
  return { data: processedData, color };
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
