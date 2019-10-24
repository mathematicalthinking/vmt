const rooms = require('../../seeders/rooms');
const tabs = require('../../seeders/tabs');

const { areObjectIdsEqual } = require('../../middleware/utils/helpers');

const roomId = '5d83f029dd0c4946d81684d2';

const room = rooms.find((room) => areObjectIdsEqual(roomId, room._id));

const tab1Id = room.tabs[0];
const tab1 = tabs.find((tab) => areObjectIdsEqual(tab._id, tab1Id));

module.exports = {
  room,
  tab1,
};
