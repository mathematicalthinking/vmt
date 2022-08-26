export default (notification, course, room, myResources) => {
  let message = null;
  const type = notification.notificationType;
  const resource = notification.resourceType;
  const username = notification.fromUser ? notification.fromUser.username : '';
  // @todo refactor switch statements\
  if (type === 'requestAccess') {
    message = `${username} is requesting to join ${resource} ${
      myResources[`${resource}s`][notification.resourceId]
        ? myResources[`${resource}s`][notification.resourceId].name
        : '<name not found>'
    }`;
  } else if (type === 'grantedAccess') {
    message = `Your request to join ${resource} ${
      resource === 'room' ? room.name : course.name
    } has been accpeted`;
  } else if (type === 'newMember') {
    message = `${username} joined ${resource} ${
      myResources[`${resource}s`][notification.resourceId]
        ? myResources[`${resource}s`][notification.resourceId].name
        : '<name not found>'
    } `;
  } else if (type === 'invitation') {
    message = `You have been invited to join ${resource} ${
      resource === 'room' ? room.name : course.name
    }`;
  } else if (type === 'assignedNewRoom') {
    message = `${username} has assigned you to room ${room.name}`;
  }
  return message;
};
