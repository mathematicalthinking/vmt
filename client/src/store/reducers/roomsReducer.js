import * as actionTypes from '../actions/actionTypes';
import merge from 'lodash/merge';
const initialState = {
  byId: {},
  allIds: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {

    case actionTypes.GOT_ROOMS:
      let updatedRooms = merge({...state.byId}, action.byId)
      return {
        ...state,
        byId: updatedRooms,
        allIds: action.allIds,
      };

    case actionTypes.UPDATED_ROOM:
      let updatedRoom = {...state.byId[action.roomId]}
      let fields = Object.keys(action.body)
      console.log("FIELDS: ", fields)
      fields.forEach(field => {
        updatedRoom[field] = action.body[field]
      })
      console.log(updatedRoom.members)
      return {
        ...state,
        byId: {
          ...state.byId,
          [action.roomId]: updatedRoom,
        },
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
