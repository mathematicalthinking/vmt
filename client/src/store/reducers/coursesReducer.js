import * as actionTypes from '../actions/actionTypes';

const initialState = {
  byId: {},
  allIds: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_COURSES: {
      const updatedCourses = { ...state.byId, ...action.byId };
      // avoid duplicates
      const updatedIds = [...new Set([...state.allIds, ...action.allIds])];
      return {
        ...state,
        byId: updatedCourses,
        allIds: updatedIds,
      };
    }
    case actionTypes.LOGOUT: {
      return initialState;
    }
    case actionTypes.CREATED_COURSE: {
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.course._id]: action.course,
        },
        allIds: [...new Set([action.course._id, ...state.allIds])],
      };
    }
    case actionTypes.REMOVE_COURSE: {
      if (!state.byId[action.courseId]) return state;
      const updatedIds = state.allIds.filter((id) => id !== action.courseId);
      const updatedById = { ...state.byId };
      delete updatedById[action.courseId];
      return {
        ...state,
        byId: updatedById,
        allIds: updatedIds,
      };
    }
    case actionTypes.UPDATED_COURSE: {
      if (!state.byId[action.courseId]) return state;
      const updatedCourse = { ...state.byId[action.courseId] };
      const fields = Object.keys(action.body);
      fields.forEach((field) => {
        updatedCourse[field] = action.body[field];
      });
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: updatedCourse,
        },
      };
    }
    case actionTypes.ADD_COURSE_ACTIVITIES: {
      if (!state.byId[action.courseId]) return state;
      const updatedCourses = { ...state.byId };
      updatedCourses[action.courseId].activities = [
        ...(updatedCourses[action.courseId].activities || []),
        ...action.activityIdsArr,
      ];

      return {
        ...state,
        byId: updatedCourses,
      };
    }
    case actionTypes.REMOVE_COURSE_ACTIVITIES: {
      if (!state.byId[action.courseId]) return state;
      const updatedCourses = { ...state.byId };

      updatedCourses[action.courseId].activities =
        updatedCourses[action.courseId].activities || [];

      updatedCourses[action.courseId].activities = updatedCourses[
        action.courseId
      ].activities.filter((id) => !action.activityIdsArr.includes(id));

      return {
        ...state,
        byId: updatedCourses,
      };
    }

    case actionTypes.ADD_COURSE_ROOMS: {
      if (!state.byId[action.courseId]) return state;
      const updatedCourses = { ...state.byId };

      updatedCourses[action.courseId].rooms =
        updatedCourses[action.courseId].rooms || [];

      const roomIds = action.roomIdsArr.filter(
        (roomId) => !updatedCourses[action.courseId].rooms.includes(roomId)
      );

      updatedCourses[action.courseId].rooms = updatedCourses[
        action.courseId
      ].rooms.concat(roomIds);

      return {
        ...state,
        byId: updatedCourses,
      };
    }

    case actionTypes.REMOVE_COURSE_ROOM: {
      if (!state.byId[action.courseId]) return state;
      const updatedById = { ...state.byId };

      updatedById[action.courseId].rooms =
        updatedById[action.courseId].rooms || [];

      updatedById[action.courseId].rooms = updatedById[
        action.courseId
      ].rooms.filter((id) => id !== action.roomId);

      return {
        ...state,
        byId: updatedById,
      };
    }

    case actionTypes.ADD_COURSE_MEMBER: {
      if (!state.byId[action.courseId]) return state;

      const members = state.byId[action.courseId].members || [];
      const memberExists = members.some(
        (member) => member.user._id === action.newMember.user._id
      );

      if (memberExists) return state;

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: {
            ...state.byId[action.courseId],
            members: [...members, action.newMember],
          },
        },
      };
    }
    case actionTypes.ADD_ROOM_TO_COURSE_ARCHIVE: {
      if (!state.byId[action.courseId]) return state;
      const courseToUpdate = { ...state.byId[action.courseId] };

      // Ensure that archive and rooms are properly initialized
      courseToUpdate.archive = courseToUpdate.archive || {};
      courseToUpdate.archive.rooms = courseToUpdate.archive.rooms || [];

      courseToUpdate.archive.rooms = [
        ...courseToUpdate.archive.rooms,
        action.roomId,
      ];

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: courseToUpdate,
        },
      };
    }
    case actionTypes.REMOVE_ROOM_FROM_COURSE_ARCHIVE: {
      if (!state.byId[action.courseId]) return state;
      const courseToUpdate = { ...state.byId[action.courseId] };

      courseToUpdate.archive = courseToUpdate.archive || {};
      courseToUpdate.archive.rooms = courseToUpdate.archive.rooms || [];

      courseToUpdate.archive.rooms = courseToUpdate.archive.rooms.filter(
        (roomId) => roomId !== action.roomId
      );

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.courseId]: courseToUpdate,
        },
      };
    }

    default:
      return state;
  }
};

export default reducer;
