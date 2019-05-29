import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize, buildLog } from '../utils';
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

export const addCourseRooms = (courseId, roomIdsArr) => {
  return {
    type: actionTypes.ADD_COURSE_ROOMS,
    courseId,
    roomIdsArr,
  };
};
export const removeCourseRooms = (courseId, roomIdsArr) => {
  return {
    type: actionTypes.REMOVE_COURSE_ROOMS,
    courseId,
    roomIdsArr,
  };
};

export const addUserRooms = newRoomsArr => {
  return {
    type: actionTypes.ADD_USER_ROOMS,
    newRoomsArr,
  };
};

export const removeUserRooms = roomIdsArr => {
  return {
    type: actionTypes.REMOVE_USER_ROOMS,
    roomIdsArr,
  };
};
export const addActivityRooms = (activityId, roomIdsArr) => {
  return {
    type: actionTypes.ADD_ACTIVITY_ROOMS,
    activityId,
    roomIdsArr,
  };
};

export const addUniqueToLog = (roomId, entry) => {
  return {
    type: actionTypes.ADD_TO_LOG,
    roomId,
    entry,
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
      const { log } = getState().rooms.byId[roomId];
      const lastEvent = log[log.length - 1];
      if (entry.description && entry.description === lastEvent.description) {
        return;
      }
      dispatch(addUniqueToLog(roomId, entry));
    }
  };
};

export const setRoomStartingPoint = roomId => {
  return (dispatch, getState) => {
    const tabs = getState().rooms.byId[roomId].tabs.map(tab => {
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
      .then()
      // eslint-disable-next-line no-console
      .catch(err => console.log('ER w THT: ', err));
  };
};

export const createRoom = body => {
  return dispatch => {
    dispatch(loading.start());
    API.post('rooms', body)
      .then(res => {
        const { result } = res.data;
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

export const createRoomFromActivity = (
  activityId,
  userId,
  dueDate,
  courseId
) => {
  return (dispatch, getState) => {
    const activity = getState().activities.byId[activityId];
    const newRoom = {
      dueDate,
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
    };
    if (courseId) newRoom.course = courseId;
    dispatch(createRoom(newRoom));
  };
};

export const updateRoom = (id, body) => {
  return (dispatch, getState) => {
    const room = { ...getState().rooms.byId[id] };
    if (body.isTrashed) {
      dispatch(removeUserRooms([id]));
      dispatch(roomsRemoved([id]));
    } else {
      dispatch(updatedRoom(id, body)); // Optimistically update the UI
    }
    API.put('rooms', id, body)
      .then()
      .catch(() => {
        if (body.isTrashed) {
          dispatch(addUserRooms([id]));
          dispatch(createdRoom(room));
        }
        const prevRoom = {};
        const keys = Object.keys(body);
        keys.forEach(key => {
          prevRoom[key] = room[key];
        });

        dispatch(updatedRoom(id, prevRoom));
        dispatch(loading.updateFail('room', keys));
        setTimeout(() => {
          dispatch(loading.clearLoadingInfo());
        }, 2000);
      });
    // API REQUEST
  };
};

export const updateRoomTab = (roomId, tabId, body) => {
  return dispatch => {
    dispatch(updatedRoomTab(roomId, tabId, body));
    API.put('tabs', tabId, body)
      .then()
      .catch(err => {
        // eslint-disable-next-line no-console
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
        const rooms = normalize(res.data.results);
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
      // eslint-disable-next-line prefer-destructuring
      temp = opts.temp;
      // eslint-disable-next-line prefer-destructuring
      events = opts.events;
    }
    API.getPopulatedById('rooms', id, temp, events)
      .then(res => {
        // creae a log combining events and chat messages
        const room = res.data.result;
        // room.currentMembers
        if (room.tabs && room.chat) {
          room.log = buildLog(room.tabs, room.chat);
        } else room.log = [];
        // consider deleting tab.events and room.chat here since we have all of the information in the log now
        dispatch(updatedRoom(id, room));
        dispatch(loading.success());
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.log(err);
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
      .then()
      .catch(err => {
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
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
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };
};

export const createdRoomConfirmed = () => {
  return {
    type: actionTypes.CREATE_ROOM_CONFIRMED,
  };
};
