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
    console.log(action.template)
      let updatedTemplates = {...state.byId}
      updatedTemplates[action.template._id] = action.template;
      return {
        ...state,
        byId: updatedTemplates,
        allIds: [action.template, ...state.allIds]
      }
    default : return state
  }
}

export default reducer;
