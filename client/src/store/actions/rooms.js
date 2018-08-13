import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import { updateUserRooms, updateUserRoomTemplates } from './user';
import { createdRoomTemplate } from './roomTemplates';

export const gotRooms = (rooms) => ({
  type: actionTypes.GOT_ROOMS,
  byId: rooms.byId,
  allIds: rooms.allIds
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
      const rooms = normalize(res.data.results)
      dispatch(gotRooms(rooms))
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
        dispatch(updateUserRoomTemplates(res.data.result[1]._id))
        // @TODO We meed to have userRooms reference rooms and not have two seperate copies. will make synchornization easier
        dispatch(createdRoom(res.data.result[0]))
        dispatch(createdRoomTemplate(res.data.result[1]))
        return dispatch(updateUserRooms(res.data.result[0]._id));
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
