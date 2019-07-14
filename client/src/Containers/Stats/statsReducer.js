export default (state, action) => {
  switch (action.type) {
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
      if (state.users.indexOf(action.user) > -1) {
        updatedUsers = state.users.filter(u => u !== action.user);
      } else {
        updatedUsers = [...state.users, action.user];
      }
      return {
        ...state,
        users: updatedUsers,
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
