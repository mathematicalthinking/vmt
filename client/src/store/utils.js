export const normalize = resources => {
  const byId = resources.reduce((accum, current) => {
    accum[current._id] = current;
    return accum;
  }, {});
  const allIds = resources.map(resource => resource._id);
  return { byId, allIds };
};

export const addUserRoleToResource = (resource, userId) => {
  if (resource.members) {
    resource.members.forEach(member => {
      if (member.user._id === userId) resource.myRole = member.role;
    });
  }
  return resource;
};

/**
 * @param  {Array} tabs
 * @param {Array} chat
 * @returns {Array} chat and events from each tab combined into a single chonological array
 */

export const buildLog = (tabs, chat) => {
  let allEvents = [];
  tabs.forEach(tab => {
    allEvents = allEvents.concat(tab.events);
  });

  allEvents = allEvents.concat(chat).sort((a, b) => a.timestamp - b.timestamp);

  // Combine drag events that had been split up for efficient sending over the socket
  // see sendEventBuffer method @ ./client/src/containers/workspace/ggbGraph.js
  let consolidatedEvents = [];
  let consolidating = false;
  allEvents.forEach(event => {
    if (!consolidating) {
      consolidatedEvents.push(event);
    } else if (event.eventArray) {
      consolidatedEvents[
        consolidatedEvents.length - 1
      ].eventArray = consolidatedEvents[
        consolidatedEvents.length - 1
      ].eventArray.concat(event.eventArray);
    }
    if (event.isMultiPart && !consolidating) {
      consolidating = true;
    } else if (!event.isMultiPart && consolidating) {
      consolidating = false;
    }
  });

  return consolidatedEvents;
};
