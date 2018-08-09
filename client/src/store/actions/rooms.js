import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { updateUserRooms, updateUserRoomTemplates } from './user';

export const gotRooms = (rooms, roomIds) => ({
  type: actionTypes.GOT_ROOMS,
  rooms,
  roomIds,
})

export const updateRoom = room => ({
  type: actionTypes.UPDATE_ROOM,
  room,
})

export const clearCurrentRoom = () => {
  return {
    type: actionTypes.CLEAR_ROOM
  }
}

export const createdRoom = resp => {
  const newRoom = resp
  return {
    type: actionTypes.CREATED_ROOM,
    newRoom,
  }
}

export const getRooms = params => {
  return dispatch => {
    API.get('room', params)
    .then(res => {
      // Normalize res
      const rooms = res.data.results.reduce((acc, current) => {
        acc[current._id] = current;
        return acc;
      }, {});
      const roomIds = Object.keys(rooms)
      console.log(roomIds)
      dispatch(gotRooms(rooms, roomIds))
    })
    .catch(err => console.log(err));
  }
}

export const getCurrentRoom = id => {
  return dispatch => {
    API.getById('room', id)
    .then(res => dispatch(updateRoom(res.data.result)))
  }
}

export const createRoom = body => {
  console.log(body)
  return dispatch => {
    API.post('room', body)
    .then(res => {
      console.log("RESPO: ", res)
      if (body.template) {
        // @TODO We meed to have userRooms reference rooms and not have two seperate copies. will make synchornization easier
        dispatch(updateUserRooms(res.data.result[0]));
        dispatch(updateUserRoomTemplates(res.data.result[1]))
        return dispatch(createdRoom(res.data.result[0]))
      }
      dispatch(createdRoom(res.data.result))
      return dispatch(updateUserRooms(res.data.result._id))
    })
  }
}

export const UpdateCurrentRoom = body => {}

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  }
}
