import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ACTIVITIES:
      let updatedActivities = merge({...state.byId}, action.byId)
      return {
        ...state,
        byId: updatedActivities,
        allIds: action.allIds,
      };

    case actionTypes.ADD_ACTIVITY:
      updatedActivities = {...state.byId};
      updatedActivities[action.activity._id] = action.activity;
      return {
        ...state,
        byId: updatedActivities,
      }

    case actionTypes.REMOVE_ACTIVITY:
      const updatedIds = state.allIds.filter(id => id !== action.activityId)
      const updatedById = {...state.byId}
      delete updatedById[action.activityId]
      return {
        ...state,
        byId: updatedById,
        allIds: updatedIds,
      }

    // @TODO if we've created a new activity alert the user so we can redirect
    // to the activity --> do this by updating the sto
    case actionTypes.ADD_ACTIVITY_ROOMS:
      updatedActivities = {...state.byId};
      updatedActivities[action.activityId].rooms = updatedActivities[action.activityId].rooms.concat(action.roomIdsArr)
      return {
        ...state,
        byId: updatedActivities,
      }

    case actionTypes.CREATED_ACTIVITY:
      updatedActivities = {...state.byId};
      updatedActivities[action.newActivity._id] = action.newActivity;
      return  {
        ...state,
        byId: updatedActivities,
        allIds: [action.newActivity._id, ...state.allIds],
      }

    case actionTypes.CLEAR_ACTIVITY:
      return {
        ...state,
        currentActivity: {},
      }

    case actionTypes.CREATE_ACTIVITY_CONFIRMED:
      return {
        ...state,
        createdNewActivity: false,
      }
      default:
      return state
  }
};

export default reducer;
