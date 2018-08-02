import * as actionTypes from '../actions/actionTypes';
const initialState = {
  courseTemplates: [],
  roomTemplates: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ROOM_TEMPLATES :
      return {
        ...state,
        roomTemplates: action.templates,
      }
    case actionTypes.GOT_COURSE_TEMPLATES :
      return {
        ...state,
        courseTemplates: action.templates,
      }
    case actionTypes.CREATED_COURSE_TEMPLATE :
      return {
        ...state,
        courseTemplates: [action.template, ...state.courseTemplates]
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
