import { max } from 'd3';
import { processData } from './processData';

export const initialState = {
  byUser: false,
  byEvent: false,
  users: [],
  events: [],
  messages: [],
  actions: [],
  lines: [],
  timeScale: null,
  min: 0,
  maxY: 0,
  units: '',
};

export default (state = initialState, action) => {
  switch (action.type) {
    case 'GENERATE_DATA': {
      const { data } = action;
      const { users, events } = state;
      const duration =
        (data[data.length - 1].timestamp - data[0].timestamp) / 1000;
      const { lines, timeScale, units } = processData(data, { users, events });
      const maxY = max(lines[0].data, d => d[1]);
      const adjDuration = duration / timeScale;
      return {
        ...state,
        lines,
        timeScale,
        units,
        maxY,
        data,
        duration: adjDuration,
      };
    }

    case 'ADD_REMOVE_FILTER': {
      let updatedFiltersArr;
      const { filterType, payload } = action;
      console.log({ payload, filterType });
      const { data, users, events } = state;
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
      const { lines } = processData(data, {
        users,
        events,
        messages,
        actions,
        [filterType]: updatedFiltersArr,
      });
      return {
        ...state,
        users,
        events,
        messages,
        actions,
        [filterType]: updatedFiltersArr,
        lines,
      };
    }

    default:
      return state;
  }
};
