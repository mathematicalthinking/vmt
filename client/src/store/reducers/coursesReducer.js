import * as actionTypes from '../actions/actionTypes';

const initialState = {
  byId: {},
  allIds: {},
  currentCourse: {}
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_COURSES:
    console.log(action.courses)
      return {
        ...state,
        byId: action.courses,
        allIds: action.courseIds,
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
    case actionTypes.CLEAR_COURSE:
      return {
        ...state,
        currentCourse: {}
      }
    case actionTypes.UPDATE_COURSE_ROOMS:
      let updatedCourse = {...state.currentCourse}
      updatedCourse.rooms.unshift(action.room)
      return {
        ...state,
        currentCourse: updatedCourse,
      }
    default:
      return state
  }
};

export default reducer;
