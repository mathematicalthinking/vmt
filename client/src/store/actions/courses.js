import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';


//@TODO HAVE MORE ACTIONS HERE FOR TRACKING STATUS OF REQUEST i.e. pending erro success
export const gotCourses = resp => {
  const courses = resp.data.results;
  return {
    type: actionTypes.GOT_COURSES,
    courses,
  }
}

export const getCourses = () => {
  return dispatch => {
    API.get('course')
    .then(resp => dispatch(gotCourses(resp)))
    .catch(err => console.log(err));
  }
}
