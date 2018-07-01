import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';

export const gotCourses = (courses) => {
  console.log('courses: ', courses)
  return {
    type: actionTypes.GOT_COURSES,
    courses,
  }
}

export const getCourses = () => {
  return dispatch => {
    API.getCourses()
    .then(result => dispatch(gotCourses(result)))
    .catch(err => console.log(err));
  }
}
