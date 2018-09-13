import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ASSIGNMENTS:
      let updatedActivitys = merge({...state.byId}, action.byId)
      return {
        ...state,
        byId: updatedActivitys,
        allIds: action.allIds,
      };

    case actionTypes.ADD_ASSIGNMENT:
      updatedActivitys = {...state.byId};
      updatedActivitys[action.activity._id] = action.activity;
      return {
        ...state,
        byId: updatedActivitys,
      }

    case actionTypes.REMOVE_ASSIGNMENT:
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
    case actionTypes.ADD_ASSIGNMENT_ROOMS:
      updatedActivitys = {...state.byId};
      updatedActivitys[action.activityId].rooms = updatedActivitys[action.activityId].rooms.concat(action.roomIdsArr)
      return {
        ...state,
        byId: updatedActivitys,
      }

    case actionTypes.CREATED_ASSIGNMENT:
      updatedActivitys = {...state.byId};
      updatedActivitys[action.newActivity._id] = action.newActivity;
      return  {
        ...state,
        byId: updatedActivitys,
        allIds: [action.newActivity._id, ...state.allIds],
      }

    case actionTypes.CLEAR_ASSIGNMENT:
      return {
        ...state,
        currentActivity: {},
      }

    case actionTypes.CREATE_ASSIGNMENT_CONFIRMED:
      return {
        ...state,
        createdNewActivity: false,
      }
      default:
      return state
  }
};

export default reducer;
