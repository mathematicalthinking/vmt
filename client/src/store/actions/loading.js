import * as actionTypes from './actionTypes';

export const start = () => {
  return {
    type: actionTypes.START
  }
}


export const success = () => {
  return {
    type: actionTypes.SUCCESS,
  }
}

export const fail = errorMessage => {
  return {
    type: actionTypes.FAIL,
    error: errorMessage,
  }
}

export const accessSuccess = () => {
  return {
    type: actionTypes.ACCESS_SUCCESS,
  }
}

export const clearError = () => {
  return {
    type: actionTypes.CLEAR_ERROR,
  }
}

export const clear = () => {
  return {
    type: actionTypes.CLEAR,
  }
}
