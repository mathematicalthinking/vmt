import * as actionTypes from '../actions/actionTypes';

const initialState = {
  loggingIn: false,
  logginError: '',
  loginSuccess: false,
  requestingAccess: false,
  requestAccessSuccess: false,
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
      loginError: action.error,
    };
    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        loginSuccess: true,
      }
    case actionTypes.REQUESTING_ACCESS:
      return {
        ...state,
        requestingAccess: true,
        requestAccessSuccess: false,
      }
    case actionTypes.ACCESS_SUCCESS:
      return {
        ...state,
        requestingAccess: false,
        requestAccessSuccess: true,
      }
    default: return {...state};
  }
}

export default reducer;
