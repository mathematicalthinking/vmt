import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
import union from 'lodash/union';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {

    case actionTypes.GOT_ROOMS:
      let updatedRooms = merge({...state.byId}, action.byId)
      let updatedIds;
      if (action.isNewRoom) {
        updatedIds = union([...state.allIds], [...action.allIds])
        console.log("updatedIds: ", updatedIds)
      } else {
        updatedIds = action.allIds
      }
      return {
        ...state,
        byId: updatedRooms,
        allIds: updatedIds
      };

    case actionTypes.LOGOUT:
      return initialState

    case actionTypes.UPDATED_ROOM:
      let updatedRoom = {...state.byId[action.roomId]}
      let fields = Object.keys(action.body)
      console.log('ACTION.NODY: ', action.body)
      fields.forEach(field => {
        updatedRoom[field] = action.body[field]
      })
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: updatedRoom,
        },
      }

    case actionTypes.UPDATED_ROOM_TAB:
      fields = Object.keys(action.body)
      let updatedTabs = state.byId[action.roomId].tabs.map(tab => {
        if (tab._id === action.tabId) {
          fields.forEach(field => {
            tab[field] = action.body[field]
          })
        }
        return tab;
      })
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: {
            ...state.byId[action.roomId],
            tabs: updatedTabs,
          }
        }
      }

    // @TODO if we've created a new room alert the user so we can redirect
    // to the room --> do this by updating the sto

    case actionTypes.CREATED_ROOM:
      updatedRooms = {...state.byId};
      updatedRooms[action.newRoom._id] = action.newRoom;
      return  {
        ...state,
        byId: updatedRooms,
        allIds: [action.newRoom._id, ...state.allIds],
      }

    case actionTypes.DESTROY_ROOM:
      let updatedObj = {...state.byId}
      let updatedList = state.allIds.filter(id => id !== action.id)
      delete updatedObj[action.id]
      return {
        ...state,
        byId: updatedObj,
        allIds: updatedList
      }

    case actionTypes.ADD_CHAT_MESSAGE:
    return {
      ...state,
      byId: {
        ...state.byId,
        [action.roomId]: {
          ...state.byId[action.roomId],
          chat: [...state.byId[action.roomId].chat, action.message]
        }
      },
    }


    case actionTypes.ADD_ROOM_MEMBER:
      let updatedMembers = [...state.byId[action.roomId].members]
      updatedMembers.push(action.body);
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: {
            ...state.byId[action.roomId],
            members: updatedMembers
          }
        },
      }

    case actionTypes.REMOVE_ROOM_MEMBER:
      updatedMembers = state.byId[action.roomId].members
        .filter(member => member._id !== action.userId)
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: {
            ...state.byId[action.roomId],
            members: updatedMembers
          }
        },
      }

    case actionTypes.REMOVE_ROOM:
      updatedRooms = {...state.byId}
      delete updatedRooms[action.id]
      let updatedRoomIds = state.allIds.filter(id => id !== action.id)
      return {
        ...state,
        byId: updatedRooms,
        allIds: updatedRoomIds,
      }

    case actionTypes.CREATE_ROOM_CONFIRMED:
      return {
        ...state,
        createdNewRoom: false,
      }
      default:
      return state
  }
};

export default reducer;
