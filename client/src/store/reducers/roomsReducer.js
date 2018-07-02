import * as actionTypes from '../actions/actionTypes';

const initialState = {
  rooms: []
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
    case actionTypes.CREATED_ROOM:
      return  {
        ...state,
        rooms: [...state.rooms, action.newRoom]
      }
  }
};

export default reducer;
