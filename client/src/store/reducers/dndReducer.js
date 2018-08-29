import * as actionTypes from '../actions/actionTypes';

const initialState = {
  cardPosition: [0,0],
  observer: null,
}

const reducer = (state = initialState, action) => {
  switch (action.Type) {
    case actionTypes.MOVE_CARD :
      return {
        ...state,
        cardPosition: action.position,
      }
    default: return state;
  }
}

export default reducer;
