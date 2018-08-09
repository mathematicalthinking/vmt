import * as actionTypes from '../actions/actionTypes';

const initialState = {
  username: '',
  id: '',
  loggedIn: false,
  loggingIn: false,
  loginError: '',
  courses: [],
  rooms: [],
  courseTemplates: [],
  roomTemplates: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        loggingIn: true,
      };
    case actionTypes.LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        loginError: action.error,
      };
    case actionTypes.LOGIN_SUCCESS:
      // login authentication
      return {
        ...state,
        loggedIn: true,
        loggingIn: false,
        username: action.user.username,
        id: action.user._id,
        courses: action.user.courses,
        rooms: action.user.rooms,
      }
    case actionTypes.UPDATE_USER_ROOMS:
      return {
        ...state,
        rooms: [action.newRoom, ...state.rooms]
      }
    case actionTypes.UPDATE_USER_COURSES:
    console.log(action.newCourse)
      return {
        ...state,
        courses: [action.newCourse, ...state.courses]
      }
    case actionTypes.UPDATE_USER_COURSE_TEMPLATES:
      return {
        ...state,
        courseTemplates: [action.newTemplate, ...state.courseTemplates],
      }
    case actionTypes.UPDATE_USER_ROOM_TEMPLATES:
      return {
        ...state,
        myRoomTemplates: [action.newTemplate, ...state.myRoomTemplates]
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
