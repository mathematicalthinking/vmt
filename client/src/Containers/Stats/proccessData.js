/* eslint-disable no-unused-vars */
export default (data, { byUser }) => {
  console.log({ data });
  let timeElapsed = 0; // seconds
  let eventCount = 0;
  let startTime = 0;
  const processedData = [];
  const timeScale = calculateTimeScale(
    data[0].timestamp,
    data[data.length - 1].timestamp
  );

  // combine events by timeScale -- i.e. get the number of events that happened between start and end of
  data.forEach((datum, i) => {
    if (data[i - 1]) {
      eventCount += 1;
      const timeToAdd = (datum.timestamp - data[i - 1].timestamp) / 1000; // in seconds
      if (i === 1) {
        console.log({ timeToAdd });
      }
      timeElapsed += timeToAdd;
      if (timeElapsed >= timeScale) {
        console.log('timeElapsed has passed an hour at event ', i);
        console.log('stats at this point: ');
        console.log(eventCount, timeElapsed, startTime);
        processedData.push([startTime, eventCount]);
        console.log('diff: ', timeElapsed / timeScale);
        const skips = Math.floor(timeElapsed / timeScale);
        console.log(skips);
        startTime += 1;
        for (i = 0; i < skips; i++) {
          processedData.push([startTime, 0]);
          startTime += 1;
        }
        timeElapsed = 0;
        eventCount = 0;
      }
      // return datum.timestamp;
    }
  });
  // processedData.unshift([-1, 0]);
  console.log(processedData);
  return { processedData, timeScale };
};

const calculateTimeScale = (start, end) => {
  let timeScale;
  const seconds = (end - start) / 1000;
  if (seconds > 31536000 * 2) {
    timeScale = 'YEAR';
  } else if (seconds > 5184000) {
    timeScale = 'MONTH';
  } else if (seconds > 1209600) {
    timeScale = 'WEEK';
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
