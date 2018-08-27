import * as actionTypes from '../actions/actionTypes';

const initialState = {
  username: '',
  id: '',
  loggedIn: false,
  loggingIn: false,
  loginError: '',
  courses: [],
  courseNotifications: [],
  roomNotifications: [],
  rooms: [],
  courseTemplates: [],
  assignments: [],
  seenTour: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_SUCCESS:
      // login authentication
      console.log(action.user)
      return {
        ...state,
        loggedIn: true,
        loggingIn: false,
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
    case actionTypes.UPDATE_USER_COURSE_TEMPLATES:
      return {
        ...state,
        courseTemplates: [action.newTemplate, ...state.courseTemplates],
      }
    case actionTypes.UPDATE_USER_ASSIGNMENTS:
      return {
        ...state,
        assignments: [action.newAssignment, ...state.assignments]
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
