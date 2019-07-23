/* eslint-disable no-unused-vars */
// @todo rename utils
export const processData = (
  data,
  { users, events, messages, actions },
  { start, end }
) => {
  const timeFilteredData = data.filter((d, i) => {
    return d.timestamp >= start && d.timestamp <= end;
  });
  const timeScale = calculateTimeScale(start, end);
  const filteredData = filterData(timeFilteredData, {
    users,
    events,
    messages,
    actions,
  });
  const lines = filteredData.map(fd => ({
    data: buildLineData(fd.data, timeScale, start, end),
    color: fd.color,
  }));
  return {
    lines,
    timeScale,
    start,
    end,
    filteredData: filteredData
      .reduce((acc, fd) => {
        const fdWithColor = fd.data.map(d => {
          if (fd.color) {
            d.filterColor = fd.color;
          }
          return d;
        });
        return acc.concat(fdWithColor);
      }, [])
      .sort((a, b) => a.timestamp - b.timestamp),
    units: timeUnitMap[timeScale],
  };
};

const filterData = (
  data,
  { users = [], events = [], messages = [], actions = [] }
) => {
  let dataSets = [];
  // If filtering by two or more users we want the lines on the graph to represent them.
  if (users.length > 1) {
    dataSets = users.map(user => {
      const filteredData = data.filter(d => {
        let criteriaMet = false;
        if ((d.user && d.user._id === user) || d.user === user) {
          criteriaMet = true;
          let includeUserMessages;
          let includeControlMessages;
          let includeEntryExitMessages;
          // this could be simplified if we were filtering for exact message type; enter and exit instead enter_exit for example
          if (messages.length > 0 && d.messageType) {
            includeUserMessages = messages.indexOf('USER') > -1;
            includeEntryExitMessages = messages.indexOf('ENTER_EXIT') > -1;
            includeControlMessages = messages.indexOf('CONTROL') > -1;
          }
          criteriaMet =
            (includeUserMessages && d.messageType === 'TEXT') ||
            (includeEntryExitMessages &&
              (d.messageType === 'JOINED_ROOM' ||
                d.messageType === 'LEFT_ROOM')) ||
            (includeControlMessages &&
              (d.messageType === 'TOOK_CONTROL' ||
                d.messageType === 'RELAESED_CONTROL')) ||
            (actions.length > 0 &&
              d.eventType &&
              actions.indexOf(d.eventType) > -1) ||
            events.length === 0;
          if (
            events.length > 0 &&
            actions.length === 0 &&
            messages.length === 0
          ) {
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
  else if (events.length > 0) {
    if (users.length === 1) {
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
    }
    if (actions.length > 0) {
      dataSets = dataSets.concat(
        actions.map(a => {
          return {
            data: data.filter(d => {
              const { eventType: et } = d;
              if (!et) return false;
              return a === et;
            }),
            color: lineColors[a],
          };
        })
      );
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
  }
  // if we're filtering by one or all users and nothing else
  else {
    // figure out users color+*
    if (users.length === 1) {
      data = data.filter(
        d => d.user && (d.user === users[0] || d.user._id === users[0])
      );
    }
    dataSets = [{ data, color: users && users[0] ? data[0].color : '#2d91f2' }];
  }
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

const buildLineData = (data, timeScale, start, end) => {
  // console.log({ data, timeScale });
  let timeElapsed = 0; // seconds
  let eventCount = 0;
  let startTime = 0;
  const processedData = [];
  // combine events by timeScale -- i.e. get the number of events that happened between start and end of timeScale unit
  data.forEach((datum, i) => {
    if (i === 0) {
      // console.log({ start });
      // console.log(datum.timestamp);
      // console.log(datum.timestamp - start);
    }
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
        // startTime += 1;
        const skips = Math.floor(timeElapsed / timeScale);
        if (skips > 0) {
          for (i = 0; i < skips * 4; i++) {
            startTime += 0.25;
            processedData.push([startTime - 0.1, 0]);
          }
        } else {
          startTime += 1;
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
  days: 'MM/DD/YYYY h:mm A',
  hours: 'MM/DD/YYYY h:mm A',
  minutes: 'h:mm:ss A',
  seconds: 'h:mm:ss A',
  all: 'MM/DD/YYYY h:mm:ss A',
};

export const lineColors = {
  MESSAGES: '#5dd74a',
  ACTIONS: '#8d4adb',
  ENTER_EXIT: '#4655d4',
  CONTROL: '#c940ce',
  USER: '#43c086',
  ADD: '#fb4b02',
  BATCH_UPDATE: '#ff8d14',
  REMOVE: '#42770a',
  UPDATE: '#cf2418',
  SELECT: '#e846ba',
  // 'UPDATE_STYLE',
  // 'CHANGE_PERSPECTIVE',
  // 'NEW_TAB',
  // 'BATCH_UPDATE',
  // 'BATCH_ADD',
  // 'SELECT',
  // 'UNDO',
  // 'REDO',
};

// export const convertToCSV = (dataArr) => {
//   console.log('converting to csv');
//   const csvString = '';
//   dataArr.forEach(d => {
//     Object.keys(d).forEach(k => {

//     })
//   })
// };
