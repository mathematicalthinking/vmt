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
    const date = new Date(grouping.timestamp).toLocaleString()
    const name = `${i+1}: ${grouping.activityName} ${date}`;
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
      

      return roomDraft;
    });
    
    return { name, roomDrafts};
  });

  return previousAssignments;
};
