import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
export const loginStart = () => {
  return {
    type: actionTypes.LOGIN_START
  }
}

export const loginSuccess = authData => {
  return {
    type: actionTypes.LOGIN_SUCCESS,
    authData: authData
  }
}

export const loginFail = err => {
  return {
    type: actionTypes.LOGIN_FAIL,
    error: err
  }
}

export const googleLogin = (username, password) => {
  return dispatch => {
    dispatch(loginStart());
    auth.googleLogin(username, password)
    .then(result => {
      dispatch(loginSuccess(result));
    })
    .catch(err => {
      dispatch(loginFail(err));
    })
  }
}

export const login = (username, password) => {
  return dispatch => {
    dispatch(loginStart());
    auth.login(username, password)
    .then(result => {
      console.log(result);
      dispatch(loginSuccess(result))
    })
    .catch(err => {
      console.log(err);
      dispatch(loginFail(err))
    })
  }
}
