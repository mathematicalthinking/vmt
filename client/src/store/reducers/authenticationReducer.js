import * as actionTypes from '../actions/actionTypes';

const initialState = {
  username: '',
  password: '',
  loggedIn: false,
  loggingIn: false,
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        loggingIn: true,
      };
    case actionTypes.LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
      };
    case actionTypes.LOGIN_SUCCESS:
      // login authentication
      return {
        ...state,
        loggedIn: true,
        loggingIn: false,
        username: action.username
      }
    default:
      return state
  }
};

export default reducer;
