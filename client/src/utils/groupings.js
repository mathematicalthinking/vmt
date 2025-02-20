/*
previousAssignments: groups assigned to specific rooms
    [
        { // each object is a room w/an added grouping name
            name: <grouping name>
            roomsDrafts: [ { activity, course, members, name }, ... ]
            dueDate: <string>,
            settings: <object>,
            timestamp: <number>
        },
    ]

groupings: collections of rooms generated from an activity
    [
        { _id: groupId, 
        activity: activityId, activityName: <string>, timestamp: <number>,
        rooms: [room1ID, room2ID, ...]
        },
    ]

rooms: 
    {   
        roomId: 
            {entirety of room including members, activity, course, groupId},
    }
*/

import { Room } from 'Model';
import { useSelector } from 'react-redux';
import { STATUS } from '../constants';

const getDueDate = (room) =>
  room && room.dueDate ? room.dueDate.split('T', 1)[0] : null;

const getRoomDraft = (room) => ({
  _id: room._id,
  activity: room.activity,
  members: room.members,
  name: room.name,
  course: room.course,
});

export const createPreviousAssignments = (groupings) => {
  const rooms = useSelector((store) => store.rooms.byId);
  const userAchivedRooms = useSelector(
    (store) =>
      (store.user && store.user.archive && store.user.archive.rooms) || []
  );
  if (!groupings || !rooms) return [];
  const assignmentsWithoutArchives = groupings.filter((grouping) =>
    grouping.rooms.every(
      (roomId) =>
        rooms[roomId] &&
        rooms[roomId].status === STATUS.DEFAULT &&
        !userAchivedRooms.includes(roomId)
    )
  );
  const previousAssignments = assignmentsWithoutArchives.map((grouping) => {
    const { _id, activityName: name } = grouping;
    const dueDate = getDueDate(rooms[grouping.rooms[0]]);
    const settings = grouping.settings || Room.getDefaultRoomSettings();

    const roomDrafts = grouping.rooms.map((roomId) =>
      getRoomDraft(rooms[roomId])
    );

    return {
      _id,
      name,
      roomDrafts,
      dueDate,
      settings,
      timestamp: grouping.timestamp,
    };
  });

  return previousAssignments;
};

export const createEditableAssignments = (groups, id) => {
  return createPreviousAssignments(groups).filter(
    (assignment) => id === assignment.roomDrafts[0].activity
  );
};
