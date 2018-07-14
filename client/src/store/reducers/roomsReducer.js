import * as actionTypes from '../actions/actionTypes';

const initialState = {
  rooms: [],
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
    default:
      return state
    // if we've created a new room alert the user so we can redirect
    // to the room --> do this by updating the sto
    case actionTypes.CREATED_ROOM:
      return  {
        ...state,
        rooms: [...state.rooms, action.newRoom],
        createdNewRoom: true,
      }
    case actionTypes.CREATE_ROOM_CONFIRMED:
      return {
        ...state,
        createdNewRoom: false,
      }
  }
};

export default reducer;
