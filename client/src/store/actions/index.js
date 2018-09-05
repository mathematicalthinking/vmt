export {
  login,
  signup,
  gotUser,
  googleLogin,
  grantAccess,
  requestAccess,
  updateUserRooms,
  updateUserCourses,
  clearNotification,
  updateUserAccessNtfs,
  updateUserAssignments,
  updateUserCourseTemplates,
  removeUserCourse,
  removeUserRooms,
  removeUserAssignments, // ARE WE STORING ASSIGNMENTS ON THE USER OBJECT?
} from './user';
export {
  fail,
  start,
  clear,
  success,
  clearError,
  accessSuccess,
} from './loading';
export {
  getRooms,
  gotRooms,
  createRoom,
  gotCurrentRoom,
  getCurrentRoom,
  clearCurrentRoom,
  createdRoomConfirmed,
  populateRoom,
  joinRoom,
  leaveRoom,
  removeRoom,
} from './rooms';
export {
  addCourse,
  getCourses,
  gotCourses,
  removeCourse,
  removeCourseRoom,
  updateCourse,
  createCourse,
  createdCourses,
  updateCourseRooms,
  updateCourseAssignments,
  clearCurrentCourse,
  populateCurrentCourse,
} from './courses';
export {
  getCourseTemplates,
  gotCourseTemplates,
  createCourseTemplate,
  createdCourseTemplate,
} from './courseTemplates';
export {
  getAssignments,
  gotAssignments,
  getCurrentAssignment,
  clearCurrentAssignment,
  gotCurrentAssignment,
  createAssignment,
  createdAssignmentConfirmed,
  removeAssignment,
} from './assignments';
