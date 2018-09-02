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
    case actionTypes.ADD_USER_COURSES:
      return {
        ...state,
        courses: state.courses.concat(action.newCoursesArr)
      }

    case actionTypes.ADD_USER_ASSIGNMENTS:
      return {
        ...state,
        assignments: state.assignments.concat(action.newAssignmentsArr)
      }

    case actionTypes.ADD_USER_ROOMS:
      return {
        ...state,
        rooms: state.rooms.concat(action.newRoomsArr)
      }

    case actionTypes.REMOVE_USER_COURSE:
      const courses = state.courses.filter(id => id !== action.courseId)
      return {...state, courses, }

    case actionTypes.REMOVE_USER_ASSIGNMENTS:
      const assignments = state.assignments.filter(id => !action.assignmentIdsArr.includes(id))
      return {...state, assignments,}

    case actionTypes.REMOVE_USER_ROOMS:
      const rooms = state.rooms.filter(id => !action.roomIdsArr.includes(id))
      return {...state, rooms,}

    case actionTypes.UPDATE_USER_COURSE_ACCESS_NTFS:
      const courseNtfs = {...state.courseNotifications}
      const updatedCourseNtfs = courseNtfs.access.filter(ntf => ntf.user._id !== action.user)
      return {
        ...state,
        courseNotifications: {...courseNtfs, access: updatedCourseNtfs},
      }

    case actionTypes.CLEAR_NOTIFICATION:
      const updatedNotifications = state[`${action.resource}Notifications`]
      return {
        ...state,
        [`${action.resource}Notifications`]: updatedNotifications,
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
