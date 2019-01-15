import * as actionTypes from '../actions/actionTypes';

const initialState = {
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
}

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
      return initialState

      case actionTypes.SUCCESS:
      return {
        ...state,
        loading: false,
        loginSuccess: true,
      }
    case actionTypes.ACCESS_SUCCESS:
      return {
        ...state,
        accessSuccess: true,
        loading: false,
        successMessage: 'Your request has been sent'
      }
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        errorMessage: '',
      }
    case actionTypes.CLEAR_ALL:
      return initialState;
    case actionTypes.UPDATE_FAIL:
      return {
        ...state,
        updateFail: true,
        updateResource: action.resource,
        updateKeys: action.keys,
        globalErrorMessage: "The last update failed, please try again"
      }
    // case actionTypes.FRONT_END_ERROR:
    //   return
    //     ...state,
    //     errorMessage: action.errorMessage,
    //     frontEndError: action.

    default: return {...state};
  }
}

export default reducer;
