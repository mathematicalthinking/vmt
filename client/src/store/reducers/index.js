import { combineReducers } from 'redux';
import user from './userReducer';
import rooms from './roomsReducer';
import courses from './coursesReducer';
import courseTemplates from './courseTemplatesReducer';
import activities from './activitiesReducer';
import loading from './loadingReducer';
import dnd from './dndReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  user,
  loading,
  courses,
  activities,
  rooms,
  courseTemplates,
  dnd,
})

export default rootReducer;

// Selector functions (prepare Data for the UI) 
export const getUserResources = (state, resource) => {
  console.log("GETTING USER RESOURCES ")
  console.log('RESOURCE: ', resource)
  if (state[resource].allIds.length > 0) {
    return state.user[resource].reduce((acc, cur) => {
      // Only get resources that are stand alone (i.e. not belonging to a course)
      let popRec = state[resource].byId[cur];
      if (resource === 'courses' || (resource !== 'courses' && !popRec.course)) {
        console.log("POP REC: ", popRec)
        acc.push(popRec)
      }
      return acc;  
    }, [])
  }
  return undefined;
}

// store, activities, activity_id, rooms
export const populateResource = (state, resourceToPop, resourceId, resources) => {
  const currentResource = {...state[resourceToPop].byId[resourceId]}
  resources.forEach(resource => {
    let populatedResources;
    if (state[resourceToPop].byId[resourceId][resource]) {
      populatedResources = state[resourceToPop].byId[resourceId][resource].filter(id => {
        console.log(state[resource].byId[id])
        return state[resource].byId[id] || null
      }).map(id => {
        return state[resource].byId[id];
      });
    }
    currentResource[resource] = populatedResources;
  })
  return currentResource;
}
