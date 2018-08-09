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
  console.log(state.user[resource])
  console.log(state[resource])
  let populatedResources;
  if (state[resource].allIds.length > 0) {
    console.log(state.user[resource])
    populatedResources = state.user[resource].map(id => {
      console.log(id)
        const popRec = state[resource].byId[id]
        console.log(popRec)
        popRec.id = id;
        return popRec
    })
    return populatedResources;
  }
  return undefined;
}
