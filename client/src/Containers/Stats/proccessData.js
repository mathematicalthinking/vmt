export default (data, { timeScale, byUser }) => {
  console.log(byUser);
  let timeElapsed = 0;
  const processedData = [];
  // collate events by timeScale -- i.e. get the number of events that happened between start and end of
  data.forEach((datum, i) => {
    if (data[i - 1]) {
      timeElapsed += datum.timestamp - data[i - 1].timestamp;
      if (timeElapsed >= timeScale * 1000) {
        processedData.push([(timeElapsed * i) / (1000 * timeScale), i]);
        timeElapsed = 0;
      }
      // return datum.timestamp;
    }
  });
  console.log(processedData);
  return processedData;
};
