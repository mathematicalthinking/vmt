import * as actionTypes from '../actions/actionTypes';

export const initialState = {
  loading: false,
  logginError: false,
  errorMessage: '',
  loginSuccess: false,
  accessSuccess: false,
  successMessage: '',
  updateFail: false,
  updateResource: null,
  globalErrorMessage: null,
  updateKeys: [],
  // frontEndError: false,
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.START:
      return {
        ...state,
        loading: true,
      };
    case actionTypes.FAIL:
      return {
        ...state,
        loading: false,
        loginError: true,
        errorMessage: action.error,
      };

    case actionTypes.LOGOUT:
      return initialState;

    case actionTypes.SUCCESS:
      return {
        ...state,
        loading: false,
        loginSuccess: true,
      };
    case actionTypes.ACCESS_SUCCESS:
      return {
        ...state,
        accessSuccess: true,
        loading: false,
        successMessage: 'Your request has been sent',
      };
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        errorMessage: '',
      };
    case actionTypes.CLEAR_ALL:
      return initialState;
    case actionTypes.UPDATE_FAIL:
      return {
        ...state,
        updateFail: true,
        updateResource: action.resource,
        updateKeys: action.keys,
        globalErrorMessage: 'The last update failed, please try again',
      };
    case actionTypes.FORGOT_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        forgotPasswordSuccess: true,
        successMessage:
          'An email with further instructions has been sent to the email address on file',
      };
    case actionTypes.RESET_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        resetPasswordSuccess: true,
      };
    case actionTypes.CONFIRM_EMAIL_SUCCESS:
      return {
        ...state,
        loading: false,
        confirmEmailSuccess: true,
      };

    default:
      return { ...state };
  }
};

export default reducer;
