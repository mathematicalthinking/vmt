import * as actionTypes from './actionTypes';
import auth from '../../utils/auth';
import API from '../../utils/apiRequests';
export const loginStart = () => {
  return {
    type: actionTypes.LOGIN_START
  }
}

export const loginSuccess = user => {
  return {
    type: actionTypes.LOGIN_SUCCESS,
    user,
  }
}

export const loginFail = err => {
  return {
    type: actionTypes.LOGIN_FAIL,
    error: err
  }
}

export const signUp = body => {
  return dispatch => {
    dispatch(loginStart())
    auth.signup(body)
    .then(resp => dispatch(loginSuccess(resp.data.result)))
    .catch(err => dispatch(loginFail(err)))
  }
}
export const updateUserRooms = newRoom => {
  return {
    type: actionTypes.UPDATE_USER_ROOMS,
    newRoom,
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
    .then(result => {;
      dispatch(loginSuccess(result))
    })
    .catch(err => {
      console.log(err);

      dispatch(loginFail(err))
    })
  }
}
