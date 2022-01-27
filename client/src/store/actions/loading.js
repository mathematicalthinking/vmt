import * as actionTypes from './actionTypes';

export const start = () => {
  return {
    type: actionTypes.START,
  };
};

export const success = () => {
  return {
    type: actionTypes.SUCCESS,
  };
};

export const fail = (errorMessage) => {
  return {
    type: actionTypes.FAIL,
    error: errorMessage,
  };
};

// seeing if I can reuse the action type.
export const multiFail = (messages) => {
  return {
    type: actionTypes.FAIL,
    error: messages,
  };
};

export const accessSuccess = () => {
  return {
    type: actionTypes.ACCESS_SUCCESS,
  };
};

export const clearError = () => {
  return {
    type: actionTypes.CLEAR_ERROR,
  };
};

export const clearLoadingInfo = () => {
  return {
    type: actionTypes.CLEAR_ALL,
  };
};

export const updateFail = (resource, keys) => {
  return {
    resource,
    keys,
    type: actionTypes.UPDATE_FAIL,
  };
};

export const forgotPasswordSuccess = () => {
  return {
    type: actionTypes.FORGOT_PASSWORD_SUCCESS,
  };
};

export const resetPasswordSuccess = () => {
  return {
    type: actionTypes.RESET_PASSWORD_SUCCESS,
  };
};

export const confirmEmailSuccess = (confirmedEmail) => {
  return {
    type: actionTypes.CONFIRM_EMAIL_SUCCESS,
    confirmedEmail,
  };
};

export const confirmEmailStart = () => {
  return {
    type: actionTypes.CONFIRM_EMAIL_START,
  };
};

export const confirmEmailFail = (error) => {
  return {
    type: actionTypes.CONFIRM_EMAIL_FAIL,
    error,
  };
};
