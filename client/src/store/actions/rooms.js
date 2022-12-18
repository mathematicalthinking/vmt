import { initializeNewDesmosActivity } from 'Containers/Workspace/Tools/DesActivityHelpers';
import { STATUS } from 'constants.js';
import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { addUserRoleToResource, normalize } from '../utils';
import * as loading from './loading';
import { updateActivity } from './activities';
import { updateCourse } from './courses';

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

export const createdRoom = (resp) => {
  const newRoom = resp;
  return {
    type: actionTypes.CREATED_ROOM,
    newRoom,
  };
};

export const roomsRemoved = (roomIds) => {
  return {
    type: actionTypes.REMOVE_ROOMS,
    roomIds,
  };
};

export const removedRoom = (id) => {
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
export const removeCourseRoom = (courseId, roomId) => {
  return {
    type: actionTypes.REMOVE_COURSE_ROOM,
    courseId,
    roomId,
  };
};
export const removeActivityRoom = (activityId, roomId) => {
  return {
    type: actionTypes.REMOVE_ACTIVITY_ROOM,
    activityId,
    roomId,
  };
};

export const addUserRooms = (newRoomsArr) => {
  return {
    type: actionTypes.ADD_USER_ROOMS,
    newRoomsArr,
  };
};

export const removeUserRooms = (roomIdsArr) => {
  return {
    type: actionTypes.REMOVE_USER_ROOMS,
    roomIdsArr,
  };
};

export const addRoomToArchive = (roomId) => {
  return {
    type: actionTypes.ADD_ROOM_TO_ARCHIVE,
    roomId,
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

export const setRoomStartingPoint = (roomId) => {
  return (dispatch, getState) => {
    const tabs = getState().rooms.byId[roomId].tabs.map((tab) => {
      tab.startingPoint = tab.currentState;
      tab.events = [];
      return tab;
    });
    dispatch(updatedRoom(roomId, { tabs, chat: [] }));
    Promise.all(
      tabs
        .map((tab) =>
          API.put('tabs', tab._id, {
            events: [],
            startingPoint: tab.startingPoint,
            startingPointBase64: tab.startingPointBase64,
          })
        )
        .concat([API.put('rooms', roomId, { chat: [] })])
    )
      .then()
      // eslint-disable-next-line no-console
      .catch((err) => console.log('ER w THT: ', err));
  };
};

/**
 * Posts the room to the database. Handles getting initialization info for DesmosActivity rooms if needed.
 * @param {Room} room
 * @returns {Promise}
 */
const addRoomToDB = async (room) => {
  const result = await (room.roomType === 'desmosActivity'
    ? initializeNewDesmosActivity(room)
    : room);
  return API.post('rooms', result);
};

// Note: we only need to update Course, Activity, & User w/new room
// in the Redux store, b/c on the server side, when a new room is created
// this info is added to the db (see server/model/Room.js -> Room.post)

// Note also that 'body' is NOT a room, but rather a kind of room configuration
// object. The server uses the information provided by the room configuation object
// to create the room and its associated tabs.
export const createRoom = (body) => {
  return (dispatch) => {
    dispatch(loading.start());
    addRoomToDB(body)
      .then((res) => {
        const { result } = res.data;
        dispatchNewRoom(result, dispatch);
        return dispatch(loading.success());
      })
      .catch((err) => {
        dispatch(loading.fail(err));
      });
  };
};

export const createGrouping = (
  roomsToCreate,
  activity,
  course = null,
  groupingName = undefined
) => {
  return (dispatch, getState) => {
    const randomNum = Math.floor(Math.random() * 100000000); // zero to ten million
    const groupId = `${activity._id}--${randomNum}`;
    const timestamp = Date.now();

    dispatch(loading.start());

    const roomsCreated = roomsToCreate.map((room) =>
      // add groupId to each room
      addRoomToDB({ ...room, groupId })
    );
    Promise.all(roomsCreated)
      .then((results) => {
        results.forEach(({ data: { result: room } }) => {
          dispatchNewRoom(room, dispatch);
        });
        const newRoomIds = results.map(
          ({ data: { result: room } }) => room._id
        );
        const newGrouping = {
          _id: groupId,
          activity: activity._id,
          activityName: groupingName || activity.name,
          timestamp,
          rooms: newRoomIds,
        };

        updateActivity(activity._id, {
          groupings: [...activity.groupings, newGrouping],
        })(dispatch, getState);

        if (activity.course && course) {
          updateCourse(course._id, {
            groupings: [...course.groupings, newGrouping],
          })(dispatch, getState);
        }

        return dispatch(loading.success());
      })
      .catch((err) => {
        dispatch(loading.fail(err));
      });
  };
};

export const updateGroupings = (course, activity, groupingId, newName) => {
  const timestamp = Date.now();
  const activityGroupingsIndex = activity.groupings.findIndex(
    (grouping) => grouping._id === groupingId
  );

  const updatedGrouping = {
    ...activity.groupings[activityGroupingsIndex],
    activityName: newName,
    timestamp,
  };
  const newActivityGroupings = [...activity.groupings];
  newActivityGroupings[activityGroupingsIndex] = updatedGrouping;

  if (course) {
    const courseGroupingsIndex = course.groupings.findIndex(
      (grouping) => grouping._id === groupingId
    );

    const newCourseGroupings = [...course.groupings];
    newCourseGroupings[courseGroupingsIndex] = updatedGrouping;

    return (dispatch, getState) => {
      updateActivity(activity._id, {
        groupings: newActivityGroupings,
      })(dispatch, getState);
      updateCourse(course._id, {
        groupings: newCourseGroupings,
      })(dispatch, getState);
    };
  }

  return (dispatch, getState) => {
    updateActivity(activity._id, {
      groupings: newActivityGroupings,
    })(dispatch, getState);
  };
};

function dispatchNewRoom(room, dispatch) {
  room.myRole = 'facilitator';
  dispatch(createdRoom(room));

  if (!room.tempRoom) {
    if (room.course) dispatch(addCourseRooms(room.course, [room._id]));
    if (room.activity) dispatch(addActivityRooms(room.activity, [room._id]));
    dispatch(addUserRooms([room._id]));
  }
}

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
    if (body.status === STATUS.ARCHIVED) {
      dispatch(addRoomToArchive(id));
    }
    if (
      body.isTrashed ||
      body.status === STATUS.TRASHED ||
      body.status === STATUS.ARCHIVED
    ) {
      dispatch(removeUserRooms([id]));
      dispatch(roomsRemoved([id]));
      dispatch(updatedRoom(id, body)); // Optimistically update the UI

      // remove room from course & activity (template) if needed
      if (room.course) {
        dispatch(removeCourseRoom(room.course, id));
      }
      if (room.activity) {
        dispatch(removeActivityRoom(room.activity, id));
      }
    } else {
      dispatch(updatedRoom(id, body)); // Optimistically update the UI
    }
    API.put('rooms', id, body)
      .then()
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);

        if (
          body.isTrashed ||
          body.status === STATUS.TRASHED ||
          body.status === STATUS.ARCHIVED
        ) {
          dispatch(addUserRooms([id]));
          dispatch(createdRoom(room));
          dispatch(updatedRoom(id, { ...body, status: STATUS.DEFAULT }));
        }
        const prevRoom = {};
        const keys = Object.keys(body);
        keys.forEach((key) => {
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

export const archiveRooms = (ids) => {
  return (dispatch) => {
    ids.forEach((id) => {
      dispatch(addRoomToArchive(id));
      dispatch(removeUserRooms([id]));
      dispatch(roomsRemoved([id]));
      dispatch(updatedRoom(id, { status: STATUS.ARCHIVED })); // Optimistically update the UI
    });

    for (let i = 0; i < ids.length; i += 50) {
      const newIds = ids.slice(i, i + 50);
      API.archiveRooms(newIds).catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
      });
    }
  };
};

export const updateRoomTab = (roomId, tabId, body) => {
  return (dispatch) => {
    dispatch(updatedRoomTab(roomId, tabId, body));
  };
};

export const removeRoomMember = (roomId, userId) => {
  return (dispatch, getState) => {
    dispatch(loading.start());
    API.removeMember('rooms', roomId, userId)
      .then((res) => {
        dispatch(updatedRoom(roomId, { members: res.data }));
        if (userId === getState().user._id) {
          dispatch(removeUserRooms([roomId]));
        }
        dispatch(loading.success());
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        dispatch(loading.fail(err));
      });
  };
};

export const getRooms = (params) => {
  return (dispatch) => {
    dispatch(loading.start());
    API.get('rooms', params)
      .then((res) => {
        // Normalize res
        const rooms = normalize(res.data.results);
        dispatch(gotRooms(rooms));
        dispatch(loading.success());
      })
      // @TODO do we need to change catch pattern for undef err.{} case / see courses/activities
      .catch((err) => dispatch(loading.fail(err.response.data.errorMessage)));
  };
};

export const getRoom = (id) => {
  return (dispatch) => {
    dispatch(loading.start());
    API.getById('rooms', id)
      .then((res) => {
        dispatch(updatedRoom(id, res.data.result));
        dispatch(loading.success());
      })
      .catch((err) => {
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
  return (dispatch) => {
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
      .then((res) => {
        // creae a log combining events and chat messages
        const room = res.data.result;
        // room.currentMembers
        if (room.tabs && room.chat) {
          // room.log = buildLog(room.tabs, room.chat);
        } else room.log = [];
        // consider deleting tab.events and room.chat here since we have all of the information in the log now
        dispatch(updatedRoom(id, room));
        dispatch(loading.success());
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const inviteToRoom = (
  roomId,
  toUserId,
  toUserUsername,
  color,
  role = 'participant'
) => {
  return (dispatch) => {
    const options = { role };
    API.grantAccess(toUserId, 'room', roomId, 'invitation', options)
      .then((res) => {
        dispatch(
          addRoomMember(roomId, {
            user: { _id: toUserId, username: toUserUsername },
            role,
            color,
            _id: (
              res.data.find((mem) => mem.user && mem.user._id === toUserId) || {
                _id: null,
              }
            )._id,
          })
        );
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };
};

export const updateRoomMembers = (roomId, updatedMembers) => {
  return (dispatch) => {
    API.updateMembers('rooms', roomId, updatedMembers)
      .then((res) => {
        dispatch(updatedRoom(roomId, res.data));
      })
      .catch((err) => {
        // dispatch(loading.fail())s
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };
};

// unused
export const removeRoom = (roomId) => {
  return (dispatch) => {
    dispatch(loading.start());
    API.remove('rooms', roomId)
      .then((res) => {
        dispatch(removeUserRooms([roomId]));
        if (res.data.result.course) {
          dispatch(removeCourseRooms(res.data.result.course, [roomId]));
        }
        // if (res.data.result.activity) {
        //   dispatch(removeActivityRooms(res.data.result.activity, [roomId]));
        // }
        dispatch(removedRoom(roomId));
        dispatch(loading.success());
      })
      .catch((err) => {
        // @todo: if fail, restore room
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

export const updateMonitorSelections = (selections) => {
  return (dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_MONITOR_SELECTIONS,
      monitorSelections: selections,
    });
  };
};

export const restoreArchivedRoom = (id) => {
  return async (dispatch, getState) => {
    const roomData = await API.get('rooms', { _id: id });
    const room = await roomData.data.results[0];
    const userId = getState().user._id;
    dispatch(removeRoomFromArchive(id)); // do this for each facilitator
    // dispatch(addUserRooms([id]));
    const roomToUpdate = addUserRoleToResource(
      {
        ...room,
        status: STATUS.DEFAULT,
        unarchive: true,
      },
      userId
    );
    // add room to store
    dispatch(updateRoom(id, roomToUpdate));
    // updates room status & unarchives room from db
    // dispatchNewRoom(updatedRoom, dispatch);

    // change room in db API.put('rooms', id, status.defualt)
    // in catch undo everything
  };
};

const removeRoomFromArchive = (id) => {
  return {
    type: actionTypes.REMOVE_ROOM_FROM_ARCHIVE,
    id,
  };
};
