import * as actionTypes from '../actions/actionTypes';

const initialState = {
  byId: {},
  allIds: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ROOMS: {
      // Note: We do not need the action.isNewRoom flag because we are handling duplicates via the Set in step 2

      // Step 1: Shallow merge state.byId and roomsWithChatCount
      const updatedRooms = { ...state.byId, ...action.byId };

      // Step 2: Combine and deduplicate IDs using a Set
      const updatedIds = [...new Set([...state.allIds, ...action.allIds])];

      // Step 3: Return the updated state
      return {
        ...state,
        byId: updatedRooms,
        allIds: updatedIds,
      };
    }

    case actionTypes.LOGOUT:
      return initialState;

    case actionTypes.UPDATED_ROOM: {
      if (!state.byId[action.roomId]) return state;
      const updatedRoom = { ...state.byId[action.roomId] };
      const fields = Object.keys(action.body);
      fields.forEach((field) => {
        updatedRoom[field] = action.body[field];
      });
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: updatedRoom,
        },
      };
    }
    case actionTypes.UPDATED_ROOM_TAB: {
      if (!state.byId[action.roomId]) return state;
      const existingTabs = state.byId[action.roomId].tabs || [];
      const updatedTabs = existingTabs.map((tab) =>
        tab._id === action.tabId ? { ...tab, ...action.body } : tab
      );
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: {
            ...state.byId[action.roomId],
            tabs: updatedTabs,
          },
        },
      };
    }
    // @TODO if we've created a new room alert the user so we can redirect
    // to the room --> do this by updating the store

    case actionTypes.CREATED_ROOM: {
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.newRoom._id]: action.newRoom,
        },
        allIds: [...state.allIds, action.newRoom._id],
      };
    }
    case actionTypes.ADD_TO_LOG: {
      if (!state.byId[action.roomId]) return state;
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: {
            ...state.byId[action.roomId],
            log: state.byId[action.roomId].log
              ? [...state.byId[action.roomId].log, action.entry]
              : [action.entry],
          },
        },
      };
    }

    case actionTypes.ADD_ROOM_MEMBER: {
      if (!state.byId[action.roomId]) return state;
      const newMember = action.body;
      const updatedMembers = [...state.byId[action.roomId].members] || [];
      // make sure newUser isn't already in room members
      // if they are, change their object to newMember
      const newMemberIndex = updatedMembers.findIndex(
        (mem) => mem.user._id === newMember.user._id
      );
      if (newMemberIndex >= 0) {
        updatedMembers[newMemberIndex] = newMember;
      } else updatedMembers.push(action.body);

      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: {
            ...state.byId[action.roomId],
            members: updatedMembers,
          },
        },
      };
    }
    case actionTypes.REMOVE_ROOM_MEMBER: {
      if (!state.byId[action.roomId]) return state;
      const existingMembers = state.byId[action.roomId].members || [];
      const updatedMembers = existingMembers.filter(
        (member) => member._id !== action.userId
      );
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: {
            ...state.byId[action.roomId],
            members: updatedMembers,
          },
        },
      };
    }
    case actionTypes.REMOVE_ROOMS: {
      const updatedById = Object.keys(state.byId).reduce((acc, roomId) => {
        if (!action.roomIds.includes(roomId)) {
          acc[roomId] = state.byId[roomId];
        }
        return acc;
      }, {});
      const updatedIds = state.allIds.filter(
        (id) => !action.roomIds.includes(id)
      );
      return {
        ...state,
        byId: updatedById,
        allIds: updatedIds,
      };
    }
    case actionTypes.CREATE_ROOM_CONFIRMED:
      return {
        ...state,
        createdNewRoom: false,
      };
    default:
      return state;
  }
};

export default reducer;
