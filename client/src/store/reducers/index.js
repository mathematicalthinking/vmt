import { combineReducers } from 'redux';
import authReducer from './authReducer';
import roomsReducer from './roomsReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  authReducer,
  roomsReducer,
  // registrationReducer,
})

export default rootReducer;
