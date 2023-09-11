// These functions standardize how dates and times are displayed throughout VMT.
// They also centralize date/time display, manipulation, and calculation so that we can change
// packages more easily.

/**
 * Files still to change:
 * - AssignRooms use of new Date -- SIMPLIFIED
 * - stat.utils and statReducer use of moment -- DONE
 * - Monitoring View -- _wasRecentlyUpdated (in last 24 hours)
 * - GgbGraph -- comparing times in sendEventBuffer
 * - boxlist -- timeDiff
 * - Home -- isWeekend
 * - there are lots of places we put timestamps into a record. It is sometimes
 *   done via Date.now() and sometimes new Date.getTime(). Although these are equivalent,
 *   it would be better to have a standard way of doing this, thus 'getCurrentTimestamp'.
 *  - utility hooks timeframes
 *
 *   Also, how should we centralize all the date / moment usage on the server side, especially
 *   so it's consistent with the client side?
 */

import { isNaN, isNumber } from 'lodash';
import moment from 'moment';

const timeUnits = {
  seconds: 1000,
  minutes: 60 * 1000,
  hours: 60 * 60 * 1000,
  days: 24 * 60 * 60 * 1000,
  weeks: 7 * 24 * 60 * 60 * 1000,
  months: 30 * 24 * 60 * 60 * 1000,
  years: 365 * 24 * 60 * 60 * 1000,
};

const toDateString = (date) => new Date(date).toLocaleDateString();
const toTimeString = (date) => new Date(date).toLocaleTimeString();
const toDateTimeString = (date) => new Date(date).toLocaleString();
const getUnixTime = (date) => new Date(date).getTime() / 1000;
const getTimestamp = (date) => (date ? new Date(date).getTime() : Date.now()); // do we need this?
const isValid = (date) => !isNaN(Date.parse(date));
const before = (date, amt, units) =>
  isValid(date) && isNumber(amt) && timeUnits[units]
    ? new Date(new Date(date) - amt * timeUnits[units])
    : undefined;

const isWithin = (dateDiff, amt, units) =>
  isNumber(dateDiff) && isNumber(amt) && timeUnits[units]
    ? Math.abs(dateDiff) <= amt * timeUnits[units]
    : false;

const toTimelineString = (timestamp) => {
  const oneWeekAgo = moment().subtract(7, 'days');
  const oneYearAgo = moment().subtract(1, 'year');
  const momentTimestamp = moment.unix(timestamp / 1000);
  let format = 'ddd h:mm:ss a';
  if (momentTimestamp.isBefore(oneYearAgo)) {
    format = 'MMMM Do YYYY, h:mm:ss a';
  } else if (momentTimestamp.isBefore(oneWeekAgo)) {
    format = 'MMMM Do, h:mm:ss a';
  }

  return momentTimestamp.format(format);
};

const isToday = (timestamp) => {
  const date = new Date(timestamp);
  const today = new Date();

  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

// @TODO: use this function for RoomsMonitor / Replayers per Steve's request
// to get replayers for rooms updated in the last hour
const isLastHour = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  return diff < 3600000;
};

export default {
  toDateString,
  toTimeString,
  toDateTimeString,
  getUnixTime,
  toTimelineString,
  getTimestamp,
  isValid,
  before,
  isWithin,
  isToday,
  isLastHour,
};
