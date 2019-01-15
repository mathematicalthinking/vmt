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

export const clearLoadingInfo = () => {
  return {
    type: actionTypes.CLEAR_ALL,
  }
}

export const updateFail = (resource, keys) => {
  return {
    type: actionTypes.UPDATE_FAIL,
    resource,
    keys,
  }
}
