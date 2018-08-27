import * as actionTypes from './actionTypes';

export const loginStart = () => {
  return {
    type: actionTypes.LOGIN_START
  }
}

export const loginSuccess = () => {
  return {
    type: actionTypes.LOGIN_SUCCESS,
  }
}

export const loginFail = errorMessage => {
  return {
    type: actionTypes.LOGIN_FAIL,
    error: errorMessage,
  }
}

export const requestingAccess = () => ({
  type: actionTypes.REQUESTING_ACCESS,
})

export const accessSuccess = () => ({
  type: actionTypes.ACCESS_SUCCESS,
})

export const accessFail = (err) => ({
  type: actionTypes.ACCESS_FAIL,
  err,
})
