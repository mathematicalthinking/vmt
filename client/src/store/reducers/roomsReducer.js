import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ROOMS:
      let updatedRooms = merge({...state.byId}, action.byId)
      return {
        ...state,
        byId: updatedRooms,
        allIds: action.allIds,
      };
    case actionTypes.UPDATE_ROOM:
      updatedRooms = {...state.byId};
      updatedRooms[action.room._id] = action.room;
      return {
        ...state,
        byId: updatedRooms,
      }
    // @TODO if we've created a new room alert the user so we can redirect
    // to the room --> do this by updating the sto
    case actionTypes.CREATED_ROOM:
      updatedRooms = {...state.byId};
      updatedRooms[action.newRoom._id] = action.newRoom;
      return  {
        ...state,
        byId: updatedRooms,
        allIds: [action.newRoom._id, ...state.allIds],
      }
    case actionTypes.CLEAR_ROOM:
      return {
        ...state,
        currentRoom: {},
      }
    case actionTypes.CREATE_ROOM_CONFIRMED:
      return {
        ...state,
        createdNewRoom: false,
      }
      default:
      return state
  }
};

export default reducer;
