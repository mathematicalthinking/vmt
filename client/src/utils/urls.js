/**
 * According to Routes/MyVMT.js, we need the path to be in the form:
 * 'myVMT/courses/:course_id/activities/:activity_id/rooms/:room_id/:resource'
 *
 * if the item has a course, we need to add it to the path
 * if the item has an activity, we need to add it to the path after the course
 * if the item has a room, we need to add it to the path after the activity
 */
// eslint-disable-next-line import/prefer-default-export
export const determineLinkPath = (item, resource) => {
  let path = '/myVMT';

  if (item.course) {
    path += `/courses/${item.course}`;
  }
  if (item.activity) {
    path += `/activities/${item.activity}`;
  }
  if (item.room) {
    path += `/rooms/${item.room}/`;
  }

  path += `/${resource}/`;
  return path;
};
