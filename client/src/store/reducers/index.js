import { combineReducers } from 'redux';
import user from './userReducer';
import rooms from './roomsReducer';
import courses from './coursesReducer';
import courseTemplates from './courseTemplatesReducer';
import roomTemplates from './roomTemplatesReducer';
import assignments from './assignmentsReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  user,
  courses,
  assignments,
  rooms,
  courseTemplates,
  roomTemplates,
})

export default rootReducer;

// Selector functions (prepare Data for the UI)
export const getUserResources = (state, resource) => {
  let populatedResources;
  if (state[resource].allIds.length > 0) {
    populatedResources = state.user[resource].map(id => {
        const popRec = state[resource].byId[id]
        return popRec
    })
    return populatedResources;
  }
  return undefined;
}

export const populateCurrentCourse = (state, courseId, resources) => {
  const currentCourse = {...state.courses.byId[courseId]}
  resources.forEach(resource => {
    const populatedResources = state.courses.byId[courseId][resource].map(id => {
      return state.assignments.byId[id];
    })
    currentCourse[resource] = populatedResources;
  })
  return currentCourse;
}
