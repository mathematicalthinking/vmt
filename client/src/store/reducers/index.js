import { combineReducers } from 'redux';
import userReducer from './userReducer';
import roomsReducer from './roomsReducer';
import coursesReducer from './coursesReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  userReducer,
  roomsReducer,
  coursesReducer,
  // registrationReducer,
})

export default rootReducer;
