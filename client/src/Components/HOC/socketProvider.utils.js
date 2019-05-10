export const createNtfMessage = (notification, course, room, myResources) => {
  let message = null;
  let type = notification.notificationType;
  let resource = notification.resourceType;
  if (type === 'requestAccess') {
    let { username } = notification.fromUser;
    message = `${username} is requesting to join ${resource} ${
      myResources[`${resource}s`][notification.resourceId].name
    }`;
  } else if (type === 'grantedAccess') {
    message = `your request to join ${resource} ${
      resource === 'room' ? room.name : course.name
    } has been accpeted`;
  } else if (type === 'newMember') {
    let { username } = notification.fromUser;
    message = `${username} joined ${resource} ${
      myResources[`${resource}s`][notification.resourceId].name
    } `;
  } else if (type === 'invitation') {
    message = `you have been invited you to join ${resource} ${
      resource === 'room' ? room.name : course.name
    }`;
  } else if (type === 'assignedNewRoom') {
    let { username } = notification.fromUser;
    message = `${username} has assigned you to room ${room.name}`;
  }
  return message;
};
