import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';

export const gotRooms = resp => {
  const rooms = resp.data.results
  return {
    type: actionTypes.GOT_ROOMS,
    rooms,
  }
}

export const getRooms = () => {
  return dispatch => {
    API.get('room')
    .then(resp => dispatch(gotRooms(resp)))
    .catch(err => console.log(err));
  }
}
