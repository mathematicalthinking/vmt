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

export const createPreviousAssignments = (groupings, rooms, assignmentName) => {

  if (!groupings || !rooms || !assignmentName) return [];
  
  const previousAssignments = groupings.map((grouping) => {
    const date = new Date(grouping.timestamp).toLocaleString()
    const name = `${assignmentName} ${date}`;
    const roomDrafts = grouping.rooms.map((roomId) => {
      const room = rooms[roomId];
      const roomDraft = {
        acivity: room.acivity,
        members: room.members,
        name: room.name,
        course: room.course,
      };
      return roomDraft;
    });
    
    return { name, roomDrafts};
  });

  console.log('previousAssignments from groupings.js:');
  console.log(previousAssignments);
  return previousAssignments;
};
