import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { updateUserRooms, updateUserRoomTemplates } from './user';

export const gotRooms = rooms => {
  return {
    type: actionTypes.GOT_ROOMS,
    rooms,
  }
}

export const gotCurrentRoom = room => {
  return {
    type: actionTypes.GOT_CURRENT_ROOM,
    room,
  }
}

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

export const getRooms = () => {
  return dispatch => {
    API.get('room')
    .then(resp => dispatch(gotRooms(resp.data.results)))
    .catch(err => console.log(err));
  }
}

export const getCurrentRoom = id => {
  return dispatch => {
    API.getById('room', id)
    .then(resp => dispatch(gotCurrentRoom(resp.data.result)))
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
      dispatch(updateUserRooms(res.data.result))
      return dispatch(createdRoom(res.data.result))
    })
  }
}

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  }
}
