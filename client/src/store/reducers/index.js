import { combineReducers } from 'redux';
import user from './userReducer';
import rooms from './roomsReducer';
import courses from './coursesReducer';
import templates from './templateReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  user,
  rooms,
  courses,
  templates,
})

export default rootReducer;

// Selector functions (prepare Data for the UI)
export const getUserResources = (state, resource) => {
  console.log(state.user[resource])
  console.log(state[resource])
  let populatedResources;
  if (state[resource].allIds.length > 0) {
    populatedResources = state.user[resource].map(id => {
      console.log(id)
        const popRec = state[resource].byId[id]
        popRec.id = id;
        return popRec
    })
    return populatedResources;
  }
  return undefined;
}
