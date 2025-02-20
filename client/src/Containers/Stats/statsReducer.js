/* eslint-disable no-unused-vars */
import { max } from 'd3';
import { processData, processCourseData, dateFormatMap } from './stats.utils';

const maxTimestamp = (array) => {
  let maxValue = array[0].timestamp;
  for (let i = 1; i < array.length; i++) {
    if (array[i].timestamp > maxValue) {
      maxValue = array[i].timestamp;
    }
  }
  return maxValue;
};

const minTimestamp = (array) => {
  let minValue = array[0].timestamp;
  for (let i = 1; i < array.length; i++) {
    if (array[i].timestamp < minValue) {
      minValue = array[i].timestamp;
    }
  }
  return minValue;
};

export const initialState = {
  byUser: false,
  byEvent: false,
  users: [],
  events: [],
  messages: [],
  actions: [],
  lines: [],
  data: [],
  filteredData: [],
  timeScale: null,
  min: 0,
  maxY: 0,
  startDateF: '',
  endDateF: '',
  startTime: 0,
  currentStartTime: 0,
  endTime: 0,
  currentEndTime: 0,
  units: '',
  durationDisplay: 0,
  rawDuration: 0,
  inChartView: true,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'GENERATE_DATA': {
      let { data } = action;
      const { users, events } = state;
      const start = minTimestamp(data);
      const end = maxTimestamp(data);
      const rawDuration = end - start;
      data = data.filter((d) => !d.isMultiPart);

      const { filteredData, lines, timeScale, units } = processData(
        data,
        { users, events },
        { start, end }
      );
      const maxY = max(lines[0].data, (d) => d[1]);
      const durationDisplay = rawDuration / 1000 / timeScale;
      return {
        ...state,
        lines,
        timeScale,
        units,
        maxY,
        data,
        filteredData,
        rawDuration,
        durationDisplay,
        startDateF: dateFormatMap[units](start),
        endDateF: dateFormatMap[units](end),
        startTime: start,
        currentStartTime: start,
        endTime: end,
        currentEndTime: end,
      };
    }

    case 'ADD_REMOVE_FILTER': {
      let updatedFiltersArr;
      const { filterType, payload } = action;
      const {
        data,
        users,
        events,
        currentStartTime,
        currentEndTime,
        maxY,
      } = state;
      let { messages, actions } = { ...state };
      if (payload === 'ALL') {
        updatedFiltersArr = [];
      } else if (state[filterType].indexOf(payload) > -1) {
        updatedFiltersArr = state[filterType].filter((u) => u !== payload);
      } else {
        updatedFiltersArr = [...state[filterType], payload];
      }
      if (filterType === 'events') {
        if (payload === 'MESSAGES') {
          messages = [];
        } else if (payload === 'ACTIONS') {
          actions = [];
        }
      }
      const { lines, filteredData } = processData(
        data,
        {
          users,
          events,
          messages,
          actions,
          [filterType]: updatedFiltersArr,
        },
        { start: currentStartTime, end: currentEndTime }
      );
      let oldMaxY = 0;
      let newMaxY = maxY;
      lines.forEach((l) => {
        const candidateMaxY = max(l.data, (d) => d[1]);
        if (candidateMaxY > oldMaxY) {
          newMaxY = candidateMaxY;
          oldMaxY = newMaxY;
        }
      });
      return {
        ...state,
        users,
        events,
        messages,
        filteredData,
        actions,
        [filterType]: updatedFiltersArr,
        lines,
        maxY: newMaxY,
      };
    }

    case 'UPDATE_TIME': {
      const {
        payload: { id, time },
      } = action;
      const {
        currentStartTime,
        currentEndTime,
        data,
        users,
        events,
        actions,
        messages,
        startTime,
        endTime,
        maxY,
      } = state;
      let newStartTime = currentStartTime;
      let newEndTime = currentEndTime;
      let newMaxY = maxY;
      if (id === 'start') {
        newStartTime = time;
      }
      if (id === 'end') {
        newEndTime = time;
      }
      if (id === 'both') {
        newStartTime = startTime;
        newEndTime = endTime;
      }
      const { filteredData, lines, timeScale, units, start, end } = processData(
        data,
        {
          users,
          events,
          actions,
          messages,
        },
        { start: newStartTime, end: newEndTime }
      );
      const newDuration = newEndTime - newStartTime;
      const durationDisplay = newDuration / 1000 / timeScale;

      // if (newTimeScale !== timeScale) {
      let oldMaxY = 0;
      lines.forEach((l) => {
        const candidateMaxY = max(l.data, (d) => d[1]);
        if (candidateMaxY > oldMaxY) {
          newMaxY = candidateMaxY;
          oldMaxY = newMaxY;
        }
      });
      // }
      return {
        ...state,
        lines,
        units,
        durationDisplay,
        timeScale,
        filteredData,
        maxY: newMaxY,
        currentStartTime: parseInt(start, 10),
        currentEndTime: parseInt(end, 10),
        startDateF: dateFormatMap[units](newStartTime),
        endDateF: dateFormatMap[units](newEndTime),
      };
    }

    case 'TOGGLE_CHART_VIEW': {
      return {
        ...state,
        inChartView: !state.inChartView,
      };
    }

    case 'GENERATE_COURSE_DATA': {
      let { data } = action;
      if (data.length === 0) return state;
      const { users, events } = state;
      const start = minTimestamp(data);
      const end = maxTimestamp(data);
      const rawDuration = end - start;
      data = data.filter((d) => !d.isMultiPart);

      const { filteredData, lines, timeScale, units } = processCourseData(
        data,
        { users, events },
        { start, end }
      );
      const maxY = max(lines[0].data, (d) => d[1]);
      const durationDisplay = rawDuration / 1000 / timeScale;
      return {
        ...state,
        lines,
        timeScale,
        units,
        maxY,
        data,
        filteredData,
        rawDuration,
        durationDisplay,
        startDateF: dateFormatMap[units](start),
        endDateF: dateFormatMap[units](end),
        startTime: start,
        currentStartTime: start,
        endTime: end,
        currentEndTime: end,
      };
    }

    default:
      return state;
  }
};
