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
  console.log(resource)
  console.log(state)
  return state.user[resource].map(id => (
    state[resource].byId[id]
  ))

}
