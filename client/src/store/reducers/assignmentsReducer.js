import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ASSIGNMENTS:
    let updatedAssignments = merge({...state.byId}, action.byId)
    return {
      ...state,
      byId: updatedAssignments,
      allIds: action.allIds,
    };
    case actionTypes.UPDATE_ASSIGNMENT:
      updatedAssignments = {...state.byId};
      updatedAssignments[action.assignment._id] = action.assignment;
      return {
        ...state,
        byId: updatedAssignments,
      }
    // @TODO if we've created a new assignment alert the user so we can redirect
    // to the assignment --> do this by updating the sto
    case actionTypes.UPDATE_ASSIGNMENT_ROOMS:
      updatedAssignments = {...state.byId};
      if (updatedAssignments[action.assignmentId].rooms) {
        updatedAssignments[action.assignmentId].rooms.push(action.roomId)
      } else updatedAssignments[action.assignmentId].rooms = [action.roomId];
      return {
        ...state,
        byId: updatedAssignments,
      }
    case actionTypes.CREATED_ASSIGNMENT:
      updatedAssignments = {...state.byId};
      updatedAssignments[action.newAssignment._id] = action.newAssignment;
      return  {
        ...state,
        byId: updatedAssignments,
        allIds: [action.newAssignment._id, ...state.allIds],
      }
    case actionTypes.CLEAR_ASSIGNMENT:
      return {
        ...state,
        currentAssignment: {},
      }
    case actionTypes.CREATE_ASSIGNMENT_CONFIRMED:
      return {
        ...state,
        createdNewAssignment: false,
      }
      default:
      return state
  }
};

export default reducer;
