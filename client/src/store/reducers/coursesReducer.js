import * as actionTypes from '../actions/actionTypes';

const initialState = {
  courses: [],
  currentCourse: {}
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_COURSES:
      return {
        ...state,
        courses: action.courses,
      };
    case actionTypes.CREATED_COURSE:
      return {
        ...state,
        courses: [action.course, ...state.courses]
      }
    case actionTypes.GOT_CURRENT_COURSE:
      return {
        ...state,
        currentCourse: action.currentCourse,
      }
    default:
      return state
  }
};

export default reducer;
