/**
 * Testing suite for the dateAndTime component. To run, type "node momenttest.js". Note that because we are running
 * via node, must use 'require' rather than 'import.' This, there is a special dateAndTime.js file here that should be
 * identical to src/utils/dateAndTime.js except that it uses 'require' rather than 'import'.
 */

const { isNaN } = require('lodash');
const moment = require('moment');
const dateAndTime = require('./dateAndTime');

const date = new Date();

const messageUsage = (date) => {
  const oneWeekAgo = moment().subtract(7, 'days');
  const oneYearAgo = moment().subtract(1, 'year');
  const momentTimestamp = moment.unix(date / 1000);
  let format = 'ddd h:mm:ss a';
  if (momentTimestamp.isBefore(oneYearAgo)) {
    format = 'MMMM Do YYYY, h:mm:ss a';
  } else if (momentTimestamp.isBefore(oneWeekAgo)) {
    format = 'MMMM Do, h:mm:ss a';
  }

  return momentTimestamp.format(format);
};

const roomsMonitorUsage = (date) => {
  const d = new Date(date);
  let month = d.getMonth() + 1;
  let day = d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [month, day, year].join('-');
};

const chatUsage = (date) => {
  const oneWeekAgo = moment().subtract(7, 'days');
  const oneYearAgo = moment().subtract(1, 'year');
  const momentTimestamp = moment.unix(date / 1000);

  let format = 'ddd h:mm:ss a';
  if (momentTimestamp.isBefore(oneYearAgo)) {
    format = 'MMMM Do YYYY, h:mm:ss a';
  } else if (momentTimestamp.isBefore(oneWeekAgo)) {
    format = 'MMMM Do, h:mm:ss a';
  }

  return momentTimestamp.format(format);
};

const dateFormatMap = {
  years: 'MM/DD/YYYY',
  months: 'MM/DD/YYYY',
  weeks: 'MM/DD/YYYY',
  days: 'MM/DD/YYYY h:mm A',
  hours: 'MM/DD/YYYY h:mm A',
  minutes: 'h:mm:ss A',
  seconds: 'h:mm:ss A',
  all: 'MM/DD/YYYY h:mm:ss A',
};

const newDateFormatMap = {
  years: dateAndTime.toDateString,
  months: dateAndTime.toDateString,
  weeks: dateAndTime.toDateString,
  days: dateAndTime.toDateTimeString,
  hours: dateAndTime.toDateTimeString,
  minutes: dateAndTime.toTimeString,
  seconds: dateAndTime.toTimeString,
  all: dateAndTime.toDateTimeString,
};

const comparisons = {
  timeline: {
    original: moment(date).format('x'),
    update: dateAndTime.getTimestamp(date),
  },
  dashboardContentBox: {
    original: moment(date).format('YYYY-MM-DD hh:mm:ss a'),
    update: dateAndTime.toDateTimeString(date),
  },
  message: {
    original: messageUsage(date),
    update: dateAndTime.toTimelineString(date),
  },
  editText: {
    original: moment(date).format('L'),
    update: dateAndTime.toDateString(date),
  },
  editRoomsAndMakeRooms: {
    original: new Date().toLocaleDateString(),
    update: dateAndTime.toDateString(new Date()),
  },
  roomsMonitor: {
    original: roomsMonitorUsage(date),
    update: dateAndTime.toDateTimeString(date),
  },
  selectionTable: {
    original: moment(date).format('LLL'),
    update: dateAndTime.toDateTimeString(date),
  },
  sharedReplayer1: {
    original: moment.unix(date / 1000).format('MM/DD/YYYY h:mm:ss A'),
    update: dateAndTime.toDateTimeString(date),
  },
  sharedReplayer2: {
    original: moment(date).format('MM/DD/YYYY h:mm:ss A'),
    update: dateAndTime.toDateTimeString(date),
  },
  sharedReplayer3: {
    original: moment.unix(date / 1000).format('MM/DD/YYYY h:mm:ss A'),
    update: dateAndTime.toDateTimeString(date),
  },
  chat: {
    original: chatUsage(date),
    update: dateAndTime.toTimelineString(date),
  },
  dashboardBoxList: {
    // although this is different, dashboardBoxList actually hands this info
    // to dashboardContent box, which formats it anyway.
    original: moment(date).format('MM/DD/YYYY h:mm:ss A'),
    update: date,
    comment:
      'although this is different, dashboardBoxList actually hands this info to dashboardContent box, which formats it anyway',
  },
  homepage: {
    original: new Date(date).toLocaleDateString(),
    update: dateAndTime.toDateString(date),
  },
  groupings: {
    original: new Date(date).toLocaleString(),
    update: dateAndTime.toDateTimeString(date),
  },
  utilityHooks1: {
    original: new Date(date).toString() !== 'Invalid Date',
    update: !isNaN(Date.parse(date)),
    comment: 'A date being tested',
  },
  utilityHooks2: {
    original: new Date('date').toString() !== 'Invalid Date',
    update: !isNaN(Date.parse('date')),
    comment: 'The string "date" being tested',
  },
  statsutils: {
    original: moment.unix(date / 1000).format(dateFormatMap.all),
    update: newDateFormatMap.all(date),
  },
  ...Object.keys(dateFormatMap).reduce(
    (acc, units) => ({
      ...acc,
      [`statsReducer-${units}`]: {
        original: moment.unix(date / 1000).format(dateFormatMap[units]),
        update: newDateFormatMap[units](date),
      },
    }),
    {}
  ),
};

Object.keys(comparisons).forEach((c) => {
  console.group(c);
  console.log(`org: ${comparisons[c].original}`);
  console.log(`upd: ${comparisons[c].update}`);
  if (comparisons[c].comment) console.log(comparisons[c].comment);
  console.groupEnd();
});

// console.log(moment(date).format('L'));
// console.log(moment(date).format('LLL'));
// console.log(moment(date).format('YYYY-MM-DD hh:mm:ss a'));
// console.log(moment(date).format('x'));
// console.log(typeof moment(date).format('x'));
// console.log(date.toLocaleDateString());
// console.log(date.toLocaleString());
// console.log(date.toString());
// console.log(date.getTime());
// console.log(typeof date.getTime());
