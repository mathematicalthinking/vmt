import * as actionTypes from '../actions/actionTypes';

const initialState = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
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
  isAdmin: false,
  inAdminMode: false,
  connected: false, // connected over the socket,
  isEmailConfirmed: false,
  ssoId: '',
  doForcePasswordChange: false,
  confirmEmailDate: null,
  settings: {
    doShowDesmosRefWarning: true,
  },
  isSuspended: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_USER:
      return {
        ...state,
        loggedIn: action.loggedIn,
        ...action.user,
        firstName: action.user.firstName || '',
        lastName: action.user.lastName || '',
        email: action.user.email || '',
      };
    case actionTypes.TOGGLE_JUST_LOGGED_IN:
      return {
        ...state,
        justLoggedIn: false,
      };
    case actionTypes.LOGOUT:
      return initialState;
    case actionTypes.UPDATE_USER:
      return {
        ...state,
        ...action.body,
      };
    case actionTypes.ADD_USER_COURSES:
      return {
        ...state,
        courses: state.courses.concat(...action.newCoursesArr),
      };

    case actionTypes.ADD_USER_ACTIVITIES:
      return {
        ...state,
        activities: state.activities.concat(action.newActivitiesArr),
      };

    case actionTypes.ADD_USER_ROOMS:
      return {
        ...state,
        rooms: state.rooms.concat(action.newRoomsArr),
      };

    case actionTypes.REMOVE_USER_COURSE: {
      const courses = state.courses.filter((id) => id !== action.courseId);
      return { ...state, courses };
    }
    case actionTypes.REMOVE_USER_ACTIVITIES: {
      const activities = state.activities.filter(
        (id) => !action.activityIdsArr.includes(id)
      );
      return { ...state, activities };
    }
    case actionTypes.REMOVE_USER_ROOMS: {
      const rooms = state.rooms.filter((id) => !action.roomIdsArr.includes(id));
      return { ...state, rooms };
    }
    case actionTypes.ADD_ROOM_TO_ARCHIVE: {
      const prevArchivedRooms = (state.archive && state.archive.rooms) || [];
      return {
        ...state,
        archive: {
          ...state.archive,
          rooms: [...prevArchivedRooms, action.roomId],
        },
        rooms: (state.rooms || []).filter((room) => room !== action.roomId),
      };
    }
    case actionTypes.UNARCHIVE_USER_ROOM: {
      const rooms = (state.archive && state.archive.rooms) || [];
      const updatedArchivedRooms = rooms.filter((id) => id !== action.roomId);
      return {
        ...state,
        archive: {
          ...state.archive,
          rooms: updatedArchivedRooms,
        },
        rooms: [...(state.rooms || []), action.roomId],
      };
    }
    case actionTypes.ADD_NOTIFICATION: {
      const newNotifications = [...state.notifications, action.ntf];
      return {
        ...state,
        notifications: newNotifications,
      };
    }
    case actionTypes.REMOVE_NOTIFICATION: {
      // let updatedNotifications = {...state[`${action.resource}Notifications`]}

      const updatedNotifications = state.notifications.filter((ntf) => {
        return ntf._id !== action.ntfId;
      });
      return {
        ...state,
        notifications: updatedNotifications,
      };
    }
    case actionTypes.CLEAR_ERROR: {
      return {
        ...state,
        loginError: '',
      };
    }
    case actionTypes.STORE_PRESUMPTIVE_GMAIL: {
      const { presumptiveEmailAddress } = action.payload;
      return {
        ...state,
        presumptiveEmailAddress,
      };
    }
    case actionTypes.SAVE_COMPONENT_UI_STATE: {
      const { key, value } = action;
      return {
        ...state,
        uiState: { ...state.uiState, [key]: value },
      };
    }
    default:
      return state;
  }
};

export default reducer;
