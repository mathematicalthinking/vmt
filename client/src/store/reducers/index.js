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
