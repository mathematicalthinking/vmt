import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_COURSES:
    // @TODO WHAT ARE YOU DOING? WE DONT NEED MERGE
      let updatedCourses = merge({...state.byId}, action.byId);
      return {
        ...state,
        byId: updatedCourses,
        allIds: action.allIds,
      }

    case actionTypes.ADD_COURSE:
      // We should probably check to make sure thid id exsits?
      updatedCourses = {...state.byId}
      updatedCourses[action.course._id] = action.course;
      return {
        ...state,
        byId: updatedCourses,
      }

    case actionTypes.CREATED_COURSE:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.course._id]: action.course
        },
        allIds: [action.course._id, ...state.allIds]
      }

    case actionTypes.REMOVE_COURSE:
      let updatedIds = state.allIds.filter(id => id !== action.courseId)
      let updatedById = {...state.byId}
      delete updatedById[action.courseId]
        return {
          ...state,
          byId: updatedById,
          allIds: updatedIds,
        }

    case actionTypes.UPDATE_COURSE:
      const key = Object.keys(action.body)[0]
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.id]: {
            ...state.byId[action.id], 
            [key]: action.body[key]
          }
        }
      }
    case actionTypes.ADD_COURSE_ACTIVITIES:
      updatedCourses = { ...state.byId}
      updatedCourses[action.courseId].activities = updatedCourses[action.courseId].activities.concat(action.activityIdsArr)
      return {
        ...state,
        byId: updatedCourses,
      }

    case actionTypes.REMOVE_COURSE_ACTIVITIES:
      updatedById = {...state.byId}
      const updatedCourseActivities = updatedById[action.courseId].activities.filter(id => id !== action.activityId)
      updatedById[action.courseId].rooms = updatedCourseActivities;
      return {
        ...state,
        byId: updatedById,
      }

    case actionTypes.ADD_COURSE_ROOMS:
      updatedCourses = {...state.byId}
      updatedCourses[action.courseId].rooms = updatedCourses[action.courseId].rooms.concat(action.roomIdsArr)
      return {
        ...state,
        byId: updatedCourses,
      }

    case actionTypes.REMOVE_COURSE_ROOMS:
      updatedById = {...state.byId}
      const updatedCourseRooms = updatedById[action.courseId].rooms.filter(id => id !== action.roomId)
      updatedById[action.courseId].rooms = updatedCourseRooms
      return {
        ...state,
        byId: updatedById,
      }
    case actionTypes.ADD_COURSE_MEMBER:
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: {
            ...state.byId[action.courseId],
            members: [...state.byId[action.courseId].members, action.newMember]
          }
        }
      }

    default:
      return state
  }
};

export default reducer;
