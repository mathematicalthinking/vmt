import { combineReducers } from 'redux';
import authReducer from './authReducer';
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  authReducer,
  // registrationReducer,
})

export default rootReducer;
