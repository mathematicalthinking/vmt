import { combineReducers } from 'redux';
import userReducer from './userReducer';
import roomsReducer from './roomsReducer';
import coursesReducer from './coursesReducer';
import templateReducer from './templateReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  userReducer,
  roomsReducer,
  coursesReducer,
  templateReducer,
})

export default rootReducer;
