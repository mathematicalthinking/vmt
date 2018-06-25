import { combineReducers } from 'redux';
import authenticationReducer from './authenticationReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  authenticationReducer,
  // registrationReducer,
})

export default rootReducer;
