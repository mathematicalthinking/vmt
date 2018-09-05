import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import Sockets from '../../utils/socket';
import { normalize } from '../utils/normalize';
import { addUserRooms, removeUserRooms } from './user';
import { addCourseRooms, removeCourseRooms } from './courses';
import { addAssignmentRooms, removeAssignmentRooms } from './assignments';
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

export const populateRoom = id => {
  return dispatch => {
    dispatch(loading.start())
    API.getById('room', id)
    .then(res => {
      console.log("POPULATED");
      dispatch(updateRoom(res.data.result))
      dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail(err)))
  }
}

export const getCurrentRoom = id => {
  return dispatch => {
    dispatch(loading.start())
    API.getById('room', id)
    .then(res => {
      dispatch(updateRoom(res.data.result))
      return dispatch(loading.success())
    })
  }
}


export const createRoom = body => {
  return dispatch => {
    dispatch(loading.start())
    API.post('room', body)
    .then(res => {
      let result = res.data.result;
      console.log(result)
      dispatch(createdRoom(result))
      if (body.course) {
        dispatch(addCourseRooms(body.course, [result._id]))
      }
      if (body.assignment) {
        dispatch(addAssignmentRooms(body.assignment, [result._id]))
      }
      dispatch(addUserRooms([result._id]))
      return dispatch(loading.success())
    })
    .catch(err => {
      console.log(err)
      dispatch(loading.fail(err))
    })
  }
}

export const removeRoom = roomId => {
  return dispatch => {
    dispatch(loading.start())
    API.remove('room', roomId)
    .then(res => {
      dispatch(removeUserRooms([roomId]));
      if (res.data.result.course) {
        dispatch(removeCourseRooms(res.data.result.course, [roomId]))
      }
      dispatch(removedRoom(roomId))
      dispatch(loading.success())
    })
  }
}

// export const addCurrentUser = (roomId, userId)

// SOCKET STUFF
export const joinRoom = (roomId, userId) => {
  return (dispatch, getState) => {
    Sockets.emit.joinRoom(roomId, userId)
    .then(res => {
      const state = getState()
      const room = state.rooms.byId[roomId]
      room.currentUsers = res.result.currentUsers
      // console.log(room)
      dispatch(updateRoom(room))
    })
    // console.log(getState)
  }

}

export const UpdateCurrentRoom = body => {}

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  }
}
