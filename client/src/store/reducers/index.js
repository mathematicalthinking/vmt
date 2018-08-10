import { combineReducers } from 'redux';
import user from './userReducer';
import rooms from './roomsReducer';
import courses from './coursesReducer';
import courseTemplates from './courseTemplatesReducer';
import roomTemplates from './roomTemplatesReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  user,
  rooms,
  courses,
  courseTemplates,
  roomTemplates,
})

export default rootReducer;

// Selector functions (prepare Data for the UI)
export const getUserResources = (state, resource) => {
  console.log('getting user ', resource)
  console.log(resource)
  let populatedResources;
  if (state[resource].allIds.length > 0) {
    console.log(state[resource].allIds)
    console.log(state.user[resource])
    populatedResources = state.user[resource].map(id => {
        const popRec = state[resource].byId[id]
        console.log(popRec)
        return popRec
    })
    console.log(populatedResources)
    return populatedResources;
  }
  console.log('')
  return undefined;
}
