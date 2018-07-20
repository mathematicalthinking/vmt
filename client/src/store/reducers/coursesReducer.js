import * as actionTypes from '../actions/actionTypes';

const initialState = {
  courses: []
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
        courses: [action.course, ...state.courses]
      }
    default:
      return state
  }
};

export default reducer;
