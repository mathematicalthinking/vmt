import * as actionTypes from '../actions/actionTypes';

const initialState = {
  loading: false,
  logginError: false,
  errorMessage: '',
  loginSuccess: false,
  accessSuccess: false,
  successMessage: '',
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
      errorMessage: action.error.toString(),
    };
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
        successMessage: 'Your request has been sent'
      }
    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        errorMessage: '',
      }
    case actionTypes.CLEAR:
      return {
        ...state,
        initialState
      }
    default: return {...state};
  }
}

export default reducer;
