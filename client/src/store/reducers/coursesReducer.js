import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_COURSES:
    let updatedCourses = merge({...state.byId}, action.byId);
      return {
        ...state,
        byId: updatedCourses,
        allIds: action.allIds,
      };
    case actionTypes.CREATED_COURSE:
      updatedCourses = {...state.byId}
      updatedCourses[action.course._id] = action.course
      return {
        ...state,
        byId: updatedCourses,
        allIds: [action.course._id, ...state.allIds]
      }
    case actionTypes.UPDATE_COURSE:
    // We should probably check to make sure thid id exsits?
      updatedCourses = {...state.byId}
      updatedCourses[action.course._id] = action.course;
      return {
        ...state,
        byId: updatedCourses,
      }
    case actionTypes.UPDATE_COURSE_ASSIGNMENTS:
      updatedCourses = { ...state.byId}
      updatedCourses[action.courseId].assignments.push(action.assignmentId)
      return {
        ...state,
        byId: updatedCourses,
      }
    // case actionTypes.CLEAR_COURSE:
    //   return {
    //     ...state,
    //     currentCourse: {}
    //   }
    case actionTypes.UPDATE_COURSE_ROOMS:
      updatedCourses = {...state.byId}
      updatedCourses[action.courseId].rooms.push(action.roomId)
      return {
        ...state,
        byId: updatedCourses,
      }
    default:
      return state
  }
};

export default reducer;
