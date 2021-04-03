import merge from 'lodash/merge';
import union from 'lodash/union';
import * as actionTypes from '../actions/actionTypes';

const initialState = {
  byId: {},
  allIds: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_ROOMS: {
      const updatedRooms = merge({ ...state.byId }, action.byId);
      let updatedIds;
      if (action.isNewRoom) {
        updatedIds = union([...state.allIds], [...action.allIds]);
      } else {
        updatedIds = action.allIds;
      }
      return {
        ...state,
        byId: updatedRooms,
        allIds: updatedIds,
      };
    }
    case actionTypes.LOGOUT:
      return initialState;

    case actionTypes.UPDATED_ROOM: {
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
      const fields = Object.keys(action.body);
      const updatedTabs = state.byId[action.roomId].tabs.map((tab) => {
        if (tab._id === action.tabId) {
          fields.forEach((field) => {
            tab[field] = action.body[field];
          });
        }
        return tab;
      });
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
    // to the room --> do this by updating the sto

    case actionTypes.CREATED_ROOM: {
      const updatedRooms = { ...state.byId };
      updatedRooms[action.newRoom._id] = action.newRoom;
      return {
        ...state,
        byId: updatedRooms,
        allIds: [...state.allIds, action.newRoom._id],
      };
    }
    case actionTypes.DESTROY_ROOM: {
      const updatedObj = { ...state.byId };
      const updatedList = state.allIds.filter((id) => id !== action.id);
      delete updatedObj[action.id];
      return {
        ...state,
        byId: updatedObj,
        allIds: updatedList,
      };
    }
    case actionTypes.ADD_TO_LOG:
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

    case actionTypes.ADD_ROOM_MEMBER: {
      const updatedMembers = [...state.byId[action.roomId].members] || [];
      updatedMembers.push(action.body);
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
      const updatedMembers = state.byId[action.roomId].members.filter(
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
      const updatedIds = state.allIds.filter(
        (id) => !action.roomIds.includes(id)
      );
      const updatedById = { ...state.byId };
      action.roomIds.forEach((id) => {
        delete updatedById[id];
      });
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
    case actionTypes.UPDATED_ROOM_MONITOR_SELECTIONS: {
      return {
        ...state,
        roomMonitorSelections: action.roomMonitorSelections,
      };
    }
    default:
      return state;
  }
};

export default reducer;
