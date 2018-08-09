import * as actionTypes from '../actions/actionTypes';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ROOM_TEMPLATES :
      return {
        ...state,
        byId: action.templates,
        allIds: action.templateIds,
      }
    case actionTypes.CREATED_ROOM_TEMPLATE :
      return {
        ...state,
        roomTemplates: [action.template, ...state.roomTemplates]
      }
    default : return state
  }
}

export default reducer;
