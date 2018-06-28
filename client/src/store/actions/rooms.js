import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';

export const gotRooms = (rooms) => {
  return {
    type: actionTypes.GOT_ROOMS,
    rooms,
  }
}

export const getRooms = () => {
  return dispatch => {
    API.get('/rooms')
    .then(result => dispatch(gotRooms(result)))
    .catch(err => console.log(err));
  }
}
