/* eslint-disable no-unused-vars */
import { max } from 'd3';
import moment from 'moment';
import { processData, dateFormatMap } from './stats.utils';

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
      const start = data[0].timestamp;
      const end = data[data.length - 1].timestamp;
      const rawDuration = end - start;
      data = data.filter(d => !d.isMultiPart);
      console.log({ data });

      const { filteredData, lines, timeScale, units } = processData(
        data,
        { users, events },
        { start, end }
      );
      const maxY = max(lines[0].data, d => d[1]);
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
        startDateF: moment.unix(start / 1000).format(dateFormatMap[units]),
        endDateF: moment.unix(end / 1000).format(dateFormatMap[units]),
        startTime: start,
        currentStartTime: start,
        endTime: end,
        currentEndTime: end,
      };
    }

    case 'ADD_REMOVE_FILTER': {
      let updatedFiltersArr;
      const { filterType, payload } = action;
      const { data, users, events, currentStartTime, currentEndTime } = state;
      let { messages, actions } = { ...state };
      if (payload === 'ALL') {
        updatedFiltersArr = [];
      } else if (state[filterType].indexOf(payload) > -1) {
        updatedFiltersArr = state[filterType].filter(u => u !== payload);
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
      return {
        ...state,
        users,
        events,
        messages,
        filteredData,
        actions,
        [filterType]: updatedFiltersArr,
        lines,
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
      lines.forEach(l => {
        const candidateMaxY = max(l.data, d => d[1]);
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
        startDateF: moment
          .unix(newStartTime / 1000)
          .format(dateFormatMap[units]),
        endDateF: moment.unix(newEndTime / 1000).format(dateFormatMap[units]),
      };
    }

    case 'TOGGLE_CHART_VIEW': {
      return {
        ...state,
        inChartView: !state.inChartView,
      };
    }

    default:
      return state;
  }
};
