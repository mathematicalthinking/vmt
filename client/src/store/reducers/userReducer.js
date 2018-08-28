import * as actionTypes from '../actions/actionTypes';

const initialState = {
  username: '',
  id: '',
  loggedIn: false,
  courses: [],
  courseNotifications: {},
  roomNotifications: {},
  rooms: [],
  courseTemplates: [],
  assignments: [],
  seenTour: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_USER:
      // login authentication
      console.log(action.user)
      return {
        ...state,
        loggedIn: true,
        username: action.user.username,
        id: action.user._id,
        courses: action.user.courses,
        courseNotifications: action.user.courseNotifications,
        rooms: action.user.rooms,
        roomNotifications: action.user.roomNotifications,
        courseTemplates: action.user.courseTemplates,
        assignments: action.user.assignments,
        seenTour: action.user.seenTour,
      }
    case actionTypes.UPDATE_USER_ROOMS:
      return {
        ...state,
        rooms: [action.newRoom, ...state.rooms]
      }
    case actionTypes.UPDATE_USER_COURSES:
      return {
        ...state,
        courses: [action.newCourse, ...state.courses]
      }
    case actionTypes.UPDATE_USER_COURSE_ACCESS_NTFS:
      const courseNtfs = {...state.courseNotifications}
      const updatedCourseNtfs = courseNtfs.access.filter(ntf => ntf.user._id !== action.user._id)
      return {
        ...state,
        courseNotifications: {...courseNtfs, access: updatedCourseNtfs},
      }
    case actionTypes.UPDATE_USER_COURSE_TEMPLATES:
      return {
        ...state,
        courseTemplates: [...state.courseTemplates, action.newTemplate],
      }
    case actionTypes.UPDATE_USER_ASSIGNMENTS:
      return {
        ...state,
        assignments: [...state.assignments, action.newAssignment]
      }
    case actionTypes.CLEAR_NOTIFICATION:
      const updatedNotifications = state[`${action.resource}Notifications`]
      return {
        ...state,

      }
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        loginError: '',
      }
    default:
      return state
  }
};

export default reducer;
