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
