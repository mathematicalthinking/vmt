import * as actionTypes from '../actions/actionTypes';

const initialState = {
  username: '',
  _id: '',
  loggedIn: false,
  courses: [],
  courseNotifications: {
    access: [],
    newRoom: [],
  },
  roomNotifications: {},
  rooms: [],
  courseTemplates: [],
  activities: [],
  seenTour: false,
  bothRoles: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_USER:
      return {
        ...state,
        loggedIn: true,
        username: action.user.username,
        _id: action.user._id,
        courses: action.user.courses,
        courseNotifications: action.user.courseNotifications,
        rooms: action.user.rooms,
        roomNotifications: action.user.roomNotifications,
        courseTemplates: action.user.courseTemplates,
        activities: action.user.activities,
        seenTour: action.user.seenTour,
        accountType: action.user.accountType,
        bothRoles: action.user.bothRoles,
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

    case actionTypes.UPDATE_USER_COURSE_ACCESS_NTFS:
      const courseNtfs = {...state.courseNotifications}
      const updatedCourseNtfs = courseNtfs.access.filter(ntf => ntf.user._id !== action.user)
      return {
        ...state,
        courseNotifications: {...courseNtfs, access: updatedCourseNtfs},
      }
    
    case actionTypes.UPDATE_NOTIFICATIONS:
      console.log(action.updatedNotifications)
      console.log(`${action.resource}Notifications`)
    return {
      ...state,
      [`${action.resource}Notifications`]: {
        ...state[`${action.resource}Notifications`],
        access: [...action.updatedNotifications.access]
      }
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
