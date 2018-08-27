export {
  login,
  signup,
  gotUser,
  grantAccess,
  requestAccess,
  googleLogin,
  updateUserRooms,
  updateUserCourses,
  updateUserAssignments,
  updateUserCourseTemplates,
  clearError,
} from './user';
export {
  start,
  success,
  fail,
} from './loading';
export {
  getRooms,
  gotRooms,
  getCurrentRoom,
  clearCurrentRoom,
  gotCurrentRoom,
  createRoom,
  createdRoomConfirmed,
} from './rooms';
export {
  getCourses,
  gotCourses,
  populateCurrentCourse,
  updateCourse,
  addCourse,
  clearCurrentCourse,
  createCourse,
  createdCourses,
  updateCourseRooms,
} from './courses';
export {
  getCourseTemplates,
  gotCourseTemplates,
  createCourseTemplate,
  createdCourseTemplate,
} from './courseTemplates';
export {
  getRoomTemplates,
  gotRoomTemplates,
  createRoomTemplate,
  createdRoomTemplate,
} from './roomTemplates';
export {
  getAssignments,
  gotAssignments,
  getCurrentAssignment,
  clearCurrentAssignment,
  gotCurrentAssignment,
  createAssignment,
  createdAssignmentConfirmed,
} from './assignments'
