import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import { updateUserRooms, removeUserRoom } from './user';
import { updateCourseRooms, removeCourseRoom } from './courses';
import { updateAssignmentRooms } from './assignments';
import * as loading from './loading'

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

export const removedRoom = id => {
  return {
    type: actionTypes.REMOVE_ROOM,
    id,
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
  return dispatch => {
    API.post('room', body)
    .then(res => {
      let result = res.data.result;
      dispatch(createdRoom(result))
      if (body.template) {
        // @TODO U[DATE ASSIGNMENTS]
        // dispatch(updateUserRoomTemplates(res.data.result[1]._id))
        // dispatch(createdRoomTemplate(res.data.result[1]))
        result = res.data.result[0];
      }
      if (body.course) {
        dispatch(updateCourseRooms(body.course, result._id))
      }
      if (body.assignment) {
        dispatch(updateAssignmentRooms(body.assignment, result._id))
      }
      return dispatch(updateUserRooms(result._id))
    })
  }
}

export const removeRoom = roomId => {
  return dispatch => {
    dispatch(loading.start())
    API.remove('room', roomId)
    .then(res => {
      dispatch(removeUserRoom(roomId));
      if (res.data.result.course) {
        dispatch(removeCourseRoom(roomId))
      }
      dispatch(removedRoom(roomId))
      dispatch(loading.success())
    })
  }
}

export const UpdateCurrentRoom = body => {}

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  }
}
