import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';

export const gotRooms = resp => {
  const rooms = resp.data.results
  return {
    type: actionTypes.GOT_ROOMS,
    rooms,
  }
}

export const createdRoom = resp => {
  console.log(resp)
  const newRoom = resp.data.result
  console.log(newRoom)
  return {
    type: actionTypes.CREATED_ROOM,
    newRoom,
  }
}

export const getRooms = () => {
  return dispatch => {
    API.get('room')
    .then(resp => dispatch(gotRooms(resp)))
    .catch(err => console.log(err));
  }
}

export const createRoom = body => {
  return dispatch => {
    API.post('room', body)
    .then(resp => dispatch(createdRoom(resp)))
  }
}

export const createdRoomConfirm = () => {
  return {
    type: actionTypes.CREATED_ROOM_CONFIRMED,
  }
}
