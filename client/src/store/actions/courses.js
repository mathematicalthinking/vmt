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

export const createdCourse = resp => {
  const course = resp.data.result
  return {
    type: actionTypes.CREATED_COURSE,
    course,
  }
}

export const getCourses = () => {
  return dispatch => {
    API.get('course')
    .then(resp => dispatch(gotCourses(resp)))
    .catch(err => console.log(err));
  }
}

export const createCourse = body => {
  return dispatch => {
    API.post('course', body)
    .then(resp =>{
      return dispatch(createdCourse(resp))
    })
    .catch(err => console.log(err))
  }
}
