/*
previousAssignments:
    [
        { // each object is a room w/an added grouping name
            name: <grouping name>
            roomsDraft: [ { activity, course, members, name }, ... ]
        },
    ]

groupings:
    [
        {
        _id: group1ID, activity: activityId, timestamp: XXXX,
        rooms: [room1ID, room2ID, ...]
        },
    ]

rooms: 
    {   
        roomId: 
            {entirety of room including members, activityId, courseId, groupId},
    }
*/

export const createPreviousAssignments = (groupings, rooms) => {
  if (!groupings || !rooms) return [];

  const previousAssignments = groupings.map((grouping, i) => {
    const _id = grouping._id;
    const date = new Date(grouping.timestamp).toLocaleString();
    const name = `${i + 1}: ${grouping.activityName} ${date}`;
    let dueDate;
    let hasDueDate = false;
    let aliasMode;
    let hasAliasMode = false;
    const roomDrafts = grouping.rooms.map((roomId) => {
      const room = rooms[roomId];
      // the following line is here b/c we don't remove rooms from
      // groupings when rooms are deleted, which means
      // the grouping contains room ids that aren't in the actuall list of rooms
      if (!room) return [];
      const roomDraft = {
        activity: room.activity,
        members: room.members,
        name: room.name,
        course: room.course,
        room: room._id,
      };

      if (!hasDueDate) {
        // <input type=date/> expects value format of: yyyy-mm-dd
        dueDate =
          (rooms[grouping.rooms[0]].dueDate &&
            rooms[grouping.rooms[0]].dueDate.split('T', 1)[0]) ||
          null;
        hasDueDate = true;
      }

      if (!hasAliasMode) {
        aliasMode =
          rooms[grouping.rooms[0]].settings.displayAliasedUsernames || false;
      }

      return roomDraft;
    });

    return { name, roomDrafts, dueDate, aliasMode, _id };
  });

  return previousAssignments;
};
