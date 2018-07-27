import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { updateUserRooms } from './user';

export const gotRooms = rooms => {
  return {
    type: actionTypes.GOT_ROOMS,
    rooms,
  }
}

export const gotCurrentRoom = room => {
  console.log(room)
  return {
    type: actionTypes.GOT_CURRENT_ROOM,
    room,
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
  return dispatch => {
    API.post('room', body)
    .then(resp => {
      console.log("RESPO: ", resp)
      dispatch(updateUserRooms(resp.data.result));
      dispatch(createdRoom(resp.data.result))
    })
  }
}

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  }
}
