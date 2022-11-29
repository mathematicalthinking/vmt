import merge from 'lodash/merge';
import * as actionTypes from '../actions/actionTypes';

const initialState = {
  byId: {},
  allIds: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ACTIVITIES: {
      const updatedActivities = merge({ ...state.byId }, action.byId);
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
    // to the activity --> do this by updating the sto
    case actionTypes.ADD_ACTIVITY_ROOMS: {
      const updatedActivities = { ...state.byId };
      updatedActivities[action.activityId].rooms = updatedActivities[
        action.activityId
      ].rooms.concat(action.roomIdsArr);
      return {
        ...state,
        byId: updatedActivities,
      };
    }
    case actionTypes.ADD_ACTIVITY_USER: {
      const updatedActivities = { ...state.byId };
      updatedActivities[action.activityId].users = updatedActivities[
        action.activityId
      ].users.concat(action.userId);
      return { ...state, byId: updatedActivities };
    }
    case actionTypes.REMOVE_ACTIVITY_USER: {
      const updatedActivities = { ...state.byId };
      updatedActivities[action.activityId].users = updatedActivities[
        action.activityId
      ].users.filter((userId) => userId !== action.userId);
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
      const updatedActivity = { ...state.byId[action.id] };
      const key = Object.keys(action.body)[0];
      updatedActivity[key] = action.body[key];
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.id]: updatedActivity,
        },
      };
    }
    case actionTypes.UPDATED_ACTIVITY_TAB: {
      const fields = Object.keys(action.body);
      const updatedTabs = state.byId[action.activityId].tabs.map((tab) => {
        if (tab._id === action.tabId) {
          fields.forEach((field) => {
            // eslint-disable-next-line no-param-reassign
            tab[field] = action.body[field];
          });
        }
        return tab;
      });
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
