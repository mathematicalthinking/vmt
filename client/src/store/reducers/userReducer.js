import * as actionTypes from '../actions/actionTypes';

const initialState = {
  firstName: '',
  lastName: '',
  username: '',
  _id: '',
  loggedIn: false,
  courses: [],
  notifications: [],
  rooms: [],
  courseTemplates: [],
  activities: [],
  seenTour: false,
  bothRoles: false,
  justLoggedIn: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_USER:
      return {
        ...state,
        loggedIn: action.loggedIn,
        username: action.user.username,
        firstName: action.user.firstName,
        lastName: action.user.lastName,
        _id: action.user._id,
        courses: action.user.courses,
        // courseNotifications: action.user.courseNotifications,
        rooms: action.user.rooms,
        // roomNotifications: action.user.roomNotifications,
        notifications: action.user.notifications,
        courseTemplates: action.user.courseTemplates,
        activities: action.user.activities,
        seenTour: action.user.seenTour,
        accountType: action.user.accountType,
        bothRoles: action.user.bothRoles,
        justLoggedIn: true,
      }
    case actionTypes.TOGGLE_JUST_LOGGED_IN:
      return {
        ...state,
        justLoggedIn: false
      }
    case actionTypes.LOGOUT:
      return initialState
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        ...action.body
      }
    case actionTypes.ADD_USER_COURSES:
      return {
        ...state,
        courses: state.courses.concat(...action.newCoursesArr)
      }

    case actionTypes.ADD_USER_ACTIVITIES:
      return {
        ...state,
        activities: state.activities.concat(action.newActivitiesArr)
      }

    case actionTypes.ADD_USER_ROOMS:
      return {
        ...state,
        rooms: state.rooms.concat(action.newRoomsArr)
      }

    case actionTypes.REMOVE_USER_COURSE:
      const courses = state.courses.filter(id => id !== action.courseId)
      return {...state, courses, }

    case actionTypes.REMOVE_USER_ACTIVITIES:
      const activities = state.activities.filter(id => !action.activityIdsArr.includes(id))
      return {...state, activities,}

    case actionTypes.REMOVE_USER_ROOMS:
      const rooms = state.rooms.filter(id => !action.roomIdsArr.includes(id))
      return {...state, rooms,}

    case actionTypes.UPDATE_NOTIFICATIONS:
    return {
      ...state,
      ...action.updatedNotifications,
    }

    case actionTypes.REMOVE_NOTIFICATION:
      // let updatedNotifications = {...state[`${action.resource}Notifications`]}
      let updatedNotifications = [...state.notifications];
      let listNotifications = updatedNotifications.filter(ntf => {
        if (ntf.toUser) {
          if ((ntf.toUser === action.user) && (ntf.resourceId === action.ntfId)) {
            return false;
          } else return true;
        } else return (ntf.resourceId !== action.ntfId)
      })
      updatedNotifications = listNotifications;
      return {
        ...state,
        notifications: updatedNotifications
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
