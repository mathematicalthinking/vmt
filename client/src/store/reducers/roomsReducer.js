import * as actionTypes from '../actions/actionTypes';

const initialState = {
  rooms: [],
  currentRoom: {},
  createdNewRoom: false,
  newRoomId: '',
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ROOMS:
      return {
        ...state,
        rooms: action.rooms,
      };
    case actionTypes.GOT_CURRENT_ROOM:
      return {
        ...state,
        currentRoom: action.room,
      }
    // @TODO if we've created a new room alert the user so we can redirect
    // to the room --> do this by updating the sto
    case actionTypes.CREATED_ROOM:
      return  {
        ...state,
        rooms: [action.newRoom, ...state.rooms],
        createdNewRoom: true,
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
