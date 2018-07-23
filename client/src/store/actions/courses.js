import * as actionTypes from './actionTypes';
import { updateUserCourses } from './user';
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
  return {
    type: actionTypes.CREATED_COURSE,
    course: resp,
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
      dispatch(updateUserCourses(resp.data.result))
      return dispatch(createdCourse(resp.data.result))
    })
    .catch(err => console.log(err))
  }
}
