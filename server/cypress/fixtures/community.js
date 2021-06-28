const seedRooms = require('../../seeders/rooms');
const tabs = require('../../seeders/tabs');
const seedActivities = require('../../seeders/activities');

const seedCourses = require('../../seeders/courses');

function addRoomTypeToResource(resource) {
  let roomType;

  const { tabs: resourceTabIds } = resource;

  resourceTabIds.forEach((resourceTabId) => {
    if (roomType === 'all') {
      return;
    }

    const seedTab = tabs.find((tab) => {
      return tab._id.toHexString() === resourceTabId.toString();
    });

    if (seedTab) {
      const { tabType } = seedTab;

      if (!roomType) {
        roomType = tabType;
      } else if (roomType !== tabType) {
        roomType = 'all';
      }
    }
  });
  resource.roomType = roomType;
  return resource;
}

function sortLatest(items) {
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

const ggb = 'geogebra';
const des = 'desmos';
const desAct = 'desmosActivity';
const prv = 'private';
const pub = 'public';

const augmentedRooms = [...seedRooms].map(addRoomTypeToResource);
const augmentedActivities = [...seedActivities].map(addRoomTypeToResource);

const allResourcesMap = {
  rooms: sortLatest(augmentedRooms.filter((r) => !r.isTrashed)),
  templates: sortLatest(augmentedActivities.filter((a) => !a.isTrashed)),
  courses: sortLatest(seedCourses.filter((c) => !c.isTrashed)),
};
const fixtures = {
  rooms: {},
  templates: {},
  courses: {},
};
const resourceTypes = ['rooms', 'templates', 'courses'];

resourceTypes.forEach((type) => {
  const allResources = allResourcesMap[type];

  const isCourses = type === 'courses';
  fixtures[type] = {
    all: allResources,
    publicAll: allResources.filter((r) => r.privacySetting === pub),
    privateAll: allResources.filter((r) => r.privacySetting === prv),
  };

  if (!isCourses) {
    Object.assign(fixtures[type], {
      allGgb: allResources.filter((r) => r.roomType === ggb),
      allDesmos: allResources.filter((r) => r.roomType === des),
      publicGgb: allResources.filter(
        (r) => r.roomType === ggb && r.privacySetting === pub
      ),
      publicDesmos: allResources.filter(
        (r) => r.roomType === des && r.privacySetting === pub
      ),
      privateGgb: allResources.filter(
        (r) => r.roomType === ggb && r.privacySetting === prv
      ),
      privateDesmos: allResources.filter(
        (r) => r.roomType === des && r.privacySetting === prv
      ),
    });
  }
});

module.exports = fixtures;
