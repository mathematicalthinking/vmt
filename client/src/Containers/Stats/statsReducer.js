import { max } from 'd3';
import { processData } from './processData';

export default (state, action) => {
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

    case 'TOGGLE_USER': {
      return {
        ...state,
        byUser: !state.byUser,
      };
    }

    case 'TOGGLE_EVENT': {
      return {
        ...state,
        byEvent: !state.byEvent,
      };
    }
    case 'ADD_REMOVE_USER': {
      let updatedUsers;
      const { users, data } = state;
      if (users.indexOf(action.user) > -1) {
        updatedUsers = users.filter(u => u !== action.user);
      } else {
        updatedUsers = [...users, action.user];
      }
      const { lines } = processData(data, { users: updatedUsers });
      return {
        ...state,
        users: updatedUsers,
        lines,
      };
    }
    case 'ADD_REMOVE_EVENT': {
      return {
        ...state,
      };
    }
    default:
      return state;
  }
};
