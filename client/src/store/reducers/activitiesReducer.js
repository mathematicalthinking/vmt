import * as actionTypes from '../actions/actionTypes';

const initialState = {
  byId: {},
  allIds: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ACTIVITIES: {
      const updatedActivities = { ...state.byId, ...action.byId };
      return {
        ...state,
        byId: updatedActivities,
        allIds: action.allIds,
      };
    }
    case actionTypes.ADD_ACTIVITY: {
      const updatedActivities = { ...state.byId };
      updatedActivities[action.activity._id] = action.activity;
      return {
        ...state,
        byId: updatedActivities,
      };
    }
    case actionTypes.LOGOUT:
      return initialState;

    case actionTypes.REMOVE_ACTIVITIES: {
      const updatedIds = state.allIds.filter(
        (id) => !action.activityIds.includes(id)
      );
      const updatedById = { ...state.byId };
      action.activityIds.forEach((id) => {
        delete updatedById[id];
      });
      return {
        ...state,
        byId: updatedById,
        allIds: updatedIds,
      };
    }
    // @TODO if we've created a new activity alert the user so we can redirect
    // to the activity --> do this by updating the store
    case actionTypes.ADD_ACTIVITY_ROOMS: {
      try {
        if (!state.byId[action.activityId]) return state;
        const updatedActivities = { ...state.byId };
        updatedActivities[action.activityId].rooms = [
          ...(updatedActivities[action.activityId].rooms || []),
          ...action.roomIdsArr,
        ];
        return {
          ...state,
          byId: updatedActivities,
        };
      } catch (error) {
        console.log('There was an error ADD_ACTIVITY_ROOMS', error);
        return {
          ...state,
        };
      }
    }
    case actionTypes.REMOVE_ACTIVITY_ROOM: {
      try {
        const currentActivity = state.byId[action.activityId];
        if (!currentActivity || !currentActivity.rooms) return state;

        const updatedRooms = currentActivity.rooms.filter(
          (id) => id !== action.roomId
        );
        const updatedActivity = {
          ...currentActivity,
          rooms: updatedRooms,
        };
        const updatedById = {
          ...state.byId,
          [action.activityId]: updatedActivity,
        };
        return {
          ...state,
          byId: updatedById,
        };
      } catch (error) {
        console.log('There was an error REMOVE_ACTIVITY_ROOMS', error);
        return {
          ...state,
        };
      }
    }
    case actionTypes.ADD_ACTIVITY_USER: {
      if (!state.byId[action.activityId]) return state;
      const updatedActivities = { ...state.byId };
      updatedActivities[action.activityId].users = [
        ...(updatedActivities[action.activityId].users || []),
        action.userId,
      ];
      return { ...state, byId: updatedActivities };
    }
    case actionTypes.REMOVE_ACTIVITY_USER: {
      if (!state.byId[action.activityId]) return state;
      const updatedActivities = { ...state.byId };
      updatedActivities[action.activityId].users = (
        updatedActivities[action.activityId].users || []
      ).filter((userId) => userId !== action.userId);
      return { ...state, byId: updatedActivities };
    }
    case actionTypes.CREATED_ACTIVITY: {
      const updatedActivities = { ...state.byId };
      updatedActivities[action.newActivity._id] = action.newActivity;
      return {
        ...state,
        byId: updatedActivities,
        allIds: [action.newActivity._id, ...state.allIds],
      };
    }
    case actionTypes.CLEAR_ACTIVITY:
      return {
        ...state,
        currentActivity: {},
      };
    case actionTypes.UPDATED_ACTIVITY: {
      if (!state.byId[action.activityId]) return state;
      const updatedActivity = { ...state.byId[action.activityId] };
      const key = Object.keys(action.body)[0];
      updatedActivity[key] = action.body[key];
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.activityId]: updatedActivity,
        },
      };
    }
    case actionTypes.UPDATED_ACTIVITY_TAB: {
      if (!state.byId[action.activityId]) return state;
      const updatedTabs = (
        state.byId[action.activityId].tabs || []
      ).map((tab) =>
        tab._id === action.tabId ? { ...tab, ...action.body } : tab
      );

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.activityId]: {
            ...state.byId[action.activityId],
            tabs: updatedTabs,
          },
        },
      };
    }
    case actionTypes.CREATE_ACTIVITY_CONFIRMED:
      return {
        ...state,
        createdNewActivity: false,
      };
    default:
      return state;
  }
};

export default reducer;
