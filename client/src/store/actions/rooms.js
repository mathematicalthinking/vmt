import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import { addUserRooms, removeUserRooms } from './user';
import { addCourseRooms, removeCourseRooms } from './courses';
import { addActivityRooms, } from './activities';
import * as loading from './loading'

export const gotRooms = (rooms, isNewRoom) => ({
  type: actionTypes.GOT_ROOMS,
  byId: rooms.byId,
  allIds: rooms.allIds,
  isNewRoom,
})

export const updatedRoom = (roomId, body) => {
  return {
    type: actionTypes.UPDATED_ROOM,
    roomId,
    body,
  }
}

export const updatedRoomTab = (roomId, tabId, body) => {
  return {
    type: actionTypes.UPDATED_ROOM_TAB,
    roomId,
    tabId,
    body,
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

export const destroyRoom = id => {
  return {
    type: actionTypes.DESTROY_ROOM,
    id,
  }
}

export const removedRoom = id => {
  return {
    type: actionTypes.REMOVE_ROOM,
    id,
  }
}

export const addRoomMember = (roomId, body) => {
  return {
    type: actionTypes.ADD_ROOM_MEMBER,
    roomId,
    body,
  }
}

export const addChatMessage = (roomId, message) => {
  return {
    type: actionTypes.ADD_CHAT_MESSAGE,
    roomId,
    message,
  }
}

export const setRoomStartingPoint = (roomId) => {
  return ((dispatch, getState) => {
    let tabs = getState().rooms.byId[roomId].tabs.map(tab => {
      tab.startingPoint = tab.currentState;
      tab.events = [];
      return tab;
    })
    dispatch(updatedRoom(roomId, {tabs, chat:[]}))
    Promise.all(tabs.map(tab => API.put('tabs', tab._id, {events: [], startingPoint: tab.startingPoint})).concat([API.put('rooms', roomId, {chat: []})]))
    .then(res => console.log('updatedTabs to new starting point'))
    .catch(err => console.log("ER w THT: ", err))
  })
}

export const createRoomFromActivity = (activityId, userId, dueDate, courseId) => {
  return (dispatch, getState) => {
    let activity = getState().activities.byId[activityId];
    let newRoom = {
      name: `${activity.name} (room)`,
      activity: activity._id,
      creator: userId,
      course: activity.course,
      description: activity.description,
      roomType: activity.roomType,
      desmosLink: activity.desmosLink,
      ggbFile: activity.ggbFile,
      instructions: activity.instructions,
      members: {user: userId, role: 'facilitator'},
      dueDate: dueDate,
    }
    if (courseId) newRoom.course = courseId;
    dispatch(createRoom(newRoom))
  }
}

export const updateRoom = (id, body) => {
  return dispatch => {
    console.log("DISPATCHING")
    if (body.isTrashed) {
      dispatch(removeUserRooms([id]))
      dispatch(destroyRoom(id))
    } else {
      dispatch(updatedRoom(id, body)) // Optimistically update the UI
    }
    API.put('rooms', id, body)
    .then(res => {
      console.log("RES:::", res)
    })
    .catch(err => {
      // @TODO IF SOMETHING WENT WRONG NOTIFY THE USER AND UNSO THE OPTIMISTIC UPDATE
      console.log(err)
    })
    // API REQUEST
  }
}

export const updateRoomTab = (roomId, tabId, body) => {
  return dispatch => {
    dispatch(updatedRoomTab(roomId, tabId, body))
    API.put('tabs', tabId, body)
    .then(res => {

    })
    .catch(err => {console.log(err)})
  }

}

export const removeRoomMember = (roomId, userId) => {
  return dispatch => {
    dispatch(loading.start())
    API.removeMember('rooms', roomId, userId)
    .then(res => {
      dispatch(updatedRoom(roomId, res.data))
    })
    .catch(err => dispatch(loading.fail(err)))
  }
}

export const getRooms = params => {
  return dispatch => {
    dispatch(loading.start())
    API.get('rooms', params)
    .then(res => {
      // Normalize res
      let rooms = normalize(res.data.results)
      dispatch(gotRooms(rooms))
      dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail(err.response.data.errorMessage)));
  }
}

export const getRoom = id => {
  return dispatch => {
    dispatch(loading.start())
    console.log("ID: ", id)
    API.getById('rooms', id)
    .then(res => {
      dispatch(updatedRoom(id, res.data.result))
      dispatch(loading.success())
    })
    .catch(err => {
      dispatch(loading.fail(err.response.data.errorMessage))
    })
  }
}

export const getRoomsIds = ids => {
  return dispatch => {
    API.getIds('rooms', ids)
    .then(res => {
      let rooms = normalize(res.data.results)
      dispatch(gotRooms(rooms))
      dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail(err.response.data.errorMessage)));
  }
}

export const populateRoom = id => {
  return dispatch => {
    dispatch(loading.start())
    API.getById('rooms', id)
    .then(res => {
      dispatch(updatedRoom(id, res.data.result))
      dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail(err.response.data.errorMessage)))
  }
}

export const createRoom = body => {
  return dispatch => {
    dispatch(loading.start())
    API.post('rooms', body)
    .then(res => {
      console.log(res)
      let result = res.data.result;
      dispatch(createdRoom(result))
      if (!body.tempRoom) {
        if (body.course) {
          dispatch(addCourseRooms(body.course, [result._id]))
        }
        if (body.activity) {
          dispatch(addActivityRooms(body.activity, [result._id]))
        }
        dispatch(addUserRooms([result._id]))
      }
      return dispatch(loading.success())
    })
    .catch(err => {
      dispatch(loading.fail(err.response.data.errorMessage))
    })
  }
}

export const updateRoomMembers = (roomId, updatedMembers) => {

  return dispatch => {
    API.updateMembers('rooms', roomId, updatedMembers)
    .then(res => {
      dispatch(updatedRoom(roomId, res.data.result))
    })
    .catch(err => console.log(err))
  }
}

export const removeRoom = roomId => {
  return dispatch => {
    dispatch(loading.start())
    API.remove('rooms', roomId)
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

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  }
}
