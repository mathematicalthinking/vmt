const activities = require("./ActivityController");
const courses = require("./CourseController");
const messages = require("./MessageController");
const rooms = require("./RoomController");
const tabs = require("./TabController");
const teams = require("./TeamController");
const user = require("./UserController");
const events = require("./eventController");
const courseTemplate = require("./courseTemplateController");
const roomTemplate = require("./roomTemplateController");
const notifications = require("./NotificationController");

module.exports = {
  activities,
  courses,
  courseTemplate,
  messages,
  rooms,
  roomTemplate,
  tabs,
  teams,
  user,
  events,
  notifications
};
