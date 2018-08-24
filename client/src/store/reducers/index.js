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

// store, assignments, assignment_id, rooms
export const populateResource = (state, resourceToPop, resourceId, resources) => {
  const currentResource = {...state[resourceToPop].byId[resourceId]}
  resources.forEach(resource => {
    // state.rooms.byId
    let populatedResources;
    if (state[resourceToPop].byId[resourceId][resource]) {
      populatedResources = state[resourceToPop].byId[resourceId][resource].map(id => {
        console.log(state[resource].byId[id])
        return state[resource].byId[id];
      });
    }
    currentResource[resource] = populatedResources;
  })
  return currentResource;
}
