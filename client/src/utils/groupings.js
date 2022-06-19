// Course/Templates: look through groupings prop for any groupID that has an
// empty object.
// Go through all rooms, looking for that groupID and build the object
// then update the redux store and DB.
/* 
      RESOURCE GROUPINGS:
          [ 
              {
                _id: group1ID, activity: activityId, timestamp: XXXX, rooms: [room1ID, room2ID, ...] 
              },
          ]
  */

const validateGroupings = (groupings, resource, updateResource) => {
  console.log('validateGroupings');
  let shouldDispatch = false;
  const updatedGroupings = [...resource.groupings];
  if (!groupings) return;

  groupings.forEach((grouping, i) => {
    if (grouping.rooms && grouping.rooms.length === 0) {
      const newGrouping = updateGrouping(resource, grouping);
      console.log('newGrouping:');
      console.log(newGrouping);
      updatedGroupings[i] = newGrouping;
      if (newGrouping.rooms.length > 0) shouldDispatch = true;
    }
  });

  if (shouldDispatch) {
    // update redux store / db
    console.log('31');
    updateResource(resource._id, { groupings: updatedGroupings });
    console.log('33');
  }
};

const updateGrouping = (resource, grouping) => {
  const groupingId = grouping._id;
  const rooms = resource.rooms || [];
  console.log('rooms:');
  console.log(rooms);
  const updatedGrouping = { ...grouping };
  console.log('groupingId:', groupingId);
  console.log('updatedGrouping before:');
  console.log(updatedGrouping);
  const roomsToGroup = rooms.filter((room) => {
    return room.groupId === groupingId;
  });
  
  console.log('updatedGrouping after:');
  console.log(updatedGrouping);
  updatedGrouping.rooms = roomsToGroup;

  return updatedGrouping;
};

export default validateGroupings;
