import * as actionTypes from '../actions/actionTypes';

const initialState = {
  username: '',
  userId: '',
  loggedIn: false,
  loggingIn: false,
  myRooms: [],
  myCourses: [],
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.LOGIN_START:
      return {
        ...state,
        loggingIn: true,
      };
    case actionTypes.LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
      };
    case actionTypes.LOGIN_SUCCESS:
      // login authentication
      return {
        ...state,
        loggedIn: true,
        loggingIn: false,
        username: action.user.username,
        myRooms: action.user.rooms,
        userId: action.user._id
      }
    case actionTypes.UPDATE_USER_ROOMS:
      return {
        ...state,
        myRooms: [...state.myRooms, action.newRoom]
      }
    default:
      return state
  }
};

export default reducer;
