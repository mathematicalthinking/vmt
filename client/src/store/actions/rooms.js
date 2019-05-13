import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize, buildLog } from '../utils';
import { addUserRooms, removeUserRooms } from './user';
import { addCourseRooms, removeCourseRooms } from './courses';
import { addActivityRooms } from './activities';
import { clearLoadingInfo } from './loading';
import * as loading from './loading';

export const gotRooms = (rooms, isNewRoom) => ({
  type: actionTypes.GOT_ROOMS,
  byId: rooms.byId,
  allIds: rooms.allIds,
  isNewRoom,
});

export const updatedRoom = (roomId, body) => {
  return {
    type: actionTypes.UPDATED_ROOM,
    roomId,
    body,
  };
};

export const updatedRoomTab = (roomId, tabId, body) => {
  return {
    type: actionTypes.UPDATED_ROOM_TAB,
    roomId,
    tabId,
    body,
  };
};

export const clearCurrentRoom = () => {
  return {
    type: actionTypes.CLEAR_ROOM,
  };
};

export const createdRoom = resp => {
  const newRoom = resp;
  return {
    type: actionTypes.CREATED_ROOM,
    newRoom,
  };
};

export const roomsRemoved = roomIds => {
  return {
    type: actionTypes.REMOVE_ROOMS,
    roomIds,
  };
};

export const removedRoom = id => {
  return {
    type: actionTypes.REMOVE_ROOM,
    id,
  };
};

export const addRoomMember = (roomId, body) => {
  return {
    type: actionTypes.ADD_ROOM_MEMBER,
    roomId,
    body,
  };
};

/**
 * @function addToLog
 * @param  {String} roomId
 * @param  {Object} message - as Message or Event
 */

export const addToLog = (roomId, entry) => {
  return (dispatch, getState) => {
    if (getState().rooms.byId[roomId].log) {
      let log = getState().rooms.byId[roomId].log;
      let lastEvent = log[log.length - 1];
      if (entry.description && entry.description === lastEvent.description) {
        return;
      }
      return dispatch(addUniqueToLog(roomId, entry));
    } else {
      // return dispatch(addUniqueToLog(roomId, entry));
    }
  };
};

export const addUniqueToLog = (roomId, entry) => {
  return {
    type: actionTypes.ADD_TO_LOG,
    roomId,
    entry,
  };
};
export const setRoomStartingPoint = roomId => {
  return (dispatch, getState) => {
    let tabs = getState().rooms.byId[roomId].tabs.map(tab => {
      tab.startingPoint = tab.currentState;
      tab.events = [];
      return tab;
    });
    dispatch(updatedRoom(roomId, { tabs, chat: [] }));
    Promise.all(
      tabs
        .map(tab =>
          API.put('tabs', tab._id, {
            events: [],
            startingPoint: tab.startingPoint,
          })
        )
        .concat([API.put('rooms', roomId, { chat: [] })])
    )
      .then(res => {})
      .catch(err => console.log('ER w THT: ', err));
  };
};

export const createRoomFromActivity = (
  activityId,
  userId,
  dueDate,
  courseId
) => {
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
      members: { user: userId, role: 'facilitator' },
      dueDate: dueDate,
    };
    if (courseId) newRoom.course = courseId;
    dispatch(createRoom(newRoom));
  };
};

export const updateRoom = (id, body) => {
  return (dispatch, getState) => {
    let room = { ...getState().rooms.byId[id] };
    if (body.isTrashed) {
      dispatch(removeUserRooms([id]));
      dispatch(roomsRemoved([id]));
    } else {
      dispatch(updatedRoom(id, body)); // Optimistically update the UI
    }
    API.put('rooms', id, body)
      .then(res => {})
      .catch(err => {
        if (body.isTrashed) {
          dispatch(addUserRooms([id]));
          dispatch(createdRoom(room));
        }
        let prevRoom = {};
        let keys = Object.keys(body);
        keys.forEach(key => {
          prevRoom[key] = room[key];
        });

        dispatch(updatedRoom(id, prevRoom));
        dispatch(loading.updateFail('room', keys));
        setTimeout(() => {
          dispatch(clearLoadingInfo());
        }, 2000);
      });
    // API REQUEST
  };
};

export const updateRoomTab = (roomId, tabId, body) => {
  return dispatch => {
    dispatch(updatedRoomTab(roomId, tabId, body));
    API.put('tabs', tabId, body)
      .then(res => {})
      .catch(err => {
        console.log(err);
      });
  };
};

export const removeRoomMember = (roomId, userId) => {
  return (dispatch, getState) => {
    dispatch(loading.start());
    API.removeMember('rooms', roomId, userId)
      .then(res => {
        dispatch(updatedRoom(roomId, { members: res.data }));
        if (userId === getState().user._id) {
          dispatch(removeUserRooms([roomId]));
        }
        dispatch(loading.success());
      })
      .catch(err => dispatch(loading.fail(err)));
  };
};

export const getRooms = params => {
  return dispatch => {
    dispatch(loading.start());
    API.get('rooms', params)
      .then(res => {
        // Normalize res
        let rooms = normalize(res.data.results);
        dispatch(gotRooms(rooms));
        dispatch(loading.success());
      })
      .catch(err => dispatch(loading.fail(err.response.data.errorMessage)));
  };
};

export const getRoom = id => {
  return dispatch => {
    dispatch(loading.start());
    API.getById('rooms', id)
      .then(res => {
        dispatch(updatedRoom(id, res.data.result));
        dispatch(loading.success());
      })
      .catch(err => {
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

/**
 * @function populdateRoom - redux middleware for fetching rooms
 * @param  {String} id room id
 * @param  {Object} Opts - temp (Boolean), events (Boolean) determies whether the rooms events are sent back with the response
 *
 */

export const populateRoom = (id, opts) => {
  return dispatch => {
    dispatch(loading.start());
    let temp;
    let events;
    // Why are you doing this?? just pass the whole opts obj
    if (opts) {
      temp = opts.temp;
      events = opts.events;
    }
    API.getPopulatedById('rooms', id, temp, events)
      .then(res => {
        // creae a log combining events and chat messages
        let room = res.data.result;
        // room.currentMembers
        console.log('ROOM: ', room);
        if (room.tabs && room.chat) {
          room.log = buildLog(room.tabs, room.chat);
        } else room.log = [];
        // consider deleting tab.events and room.chat here since we have all of the information in the log now
        dispatch(updatedRoom(id, room));
        dispatch(loading.success());
      })
      .catch(err => {
        console.log(err);
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const createRoom = body => {
  return dispatch => {
    dispatch(loading.start());
    API.post('rooms', body)
      .then(res => {
        let result = res.data.result;
        result.myRole = 'facilitator';
        dispatch(createdRoom(result));
        if (!body.tempRoom) {
          if (body.course) {
            dispatch(addCourseRooms(body.course, [result._id]));
          }
          if (body.activity) {
            dispatch(addActivityRooms(body.activity, [result._id]));
          }
          dispatch(addUserRooms([result._id]));
        }
        return dispatch(loading.success());
      })
      .catch(err => {
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const inviteToRoom = (roomId, toUserId, toUserUsername) => {
  return dispatch => {
    dispatch(
      addRoomMember(roomId, {
        user: { _id: toUserId, username: toUserUsername },
        role: 'participant',
      })
    );
    API.grantAccess(toUserId, 'room', roomId, 'invitation')
      .then(res => {})
      .catch(err => {
        console.log(err);
      });
  };
};

export const updateRoomMembers = (roomId, updatedMembers) => {
  return dispatch => {
    API.updateMembers('rooms', roomId, updatedMembers)
      .then(res => {
        dispatch(updatedRoom(roomId, res.data));
      })
      .catch(err => {
        // dispatch(loading.fail())s
        console.log(err);
      });
  };
};

export const removeRoom = roomId => {
  return dispatch => {
    dispatch(loading.start());
    API.remove('rooms', roomId)
      .then(res => {
        dispatch(removeUserRooms([roomId]));
        if (res.data.result.course) {
          dispatch(removeCourseRooms(res.data.result.course, [roomId]));
        }
        dispatch(removedRoom(roomId));
        dispatch(loading.success());
      })
      .catch(err => {
        dispatch(loading.fail());
        console.log(err);
      });
  };
};

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  };
};
