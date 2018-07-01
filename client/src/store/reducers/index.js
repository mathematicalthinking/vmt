import { combineReducers } from 'redux';
import authReducer from './authReducer';
import roomsReducer from './roomsReducer';
import coursesReducer from './coursesReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  authReducer,
  roomsReducer,
  coursesReducer,
  // registrationReducer,
})

export default rootReducer;
