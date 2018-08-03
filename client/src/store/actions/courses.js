import * as actionTypes from './actionTypes';
import { updateUserCourses, updateUserCourseTemplates } from './user';
import API from '../../utils/apiRequests';


//@TODO HAVE MORE ACTIONS HERE FOR TRACKING STATUS OF REQUEST i.e. pending erro success
export const gotCourses = resp => {
  const courses = resp.data.results;
  return {
    type: actionTypes.GOT_COURSES,
    courses,
  }
}

export const gotCurrentCourse = currentCourse => {
  return {
    type: actionTypes.GOT_CURRENT_COURSE,
    currentCourse,
  }
}
export const createdCourse = resp => {
  return {
    type: actionTypes.CREATED_COURSE,
    course: resp,
  }
}

export const updateCourseRooms = room => {
  return {
    type: actionTypes.UPDATE_COURSE_ROOMS,
    room,
  }
}

// MIDDLEWARE
export const getCourses = () => {
  return dispatch => {
    API.get('course')
    .then(resp => dispatch(gotCourses(resp)))
    .catch(err => console.log(err));
  }
}

export const getCurrentCourse = id => {
  return dispatch => {
    API.getById('course', id)
    .then(resp => dispatch(gotCurrentCourse(resp.data.result)))
    .catch(err => console.log(err))
  }
}

export const createCourse = body => {
  return dispatch => {
    console.log(body)
    API.post('course', body)
    .then(res =>{
      console.log(body)
      if (body.template) {
        // NB If we're creating a template we're going to get back two results in an array (the course that was created & then template that was created)
        dispatch(updateUserCourses(res.data.result[0]))
        dispatch(updateUserCourseTemplates({...res.data.result[1]}))
        return dispatch(createdCourse(res.data.result[0]))
      }
      dispatch(updateUserCourses(res.data.result))
      return dispatch(createdCourse(res.data.result))
    })
    .catch(err => console.log(err))
  }
}

export const grantAccess = (user, resource, id) => {
  return dispatch => {
    API.grantAccess(user, resource, id)
    .then(resp => {
      // dispatch(updateUserCourses(resp.data.result)) @TODO Need to update the notifcations associated with this course
      return dispatch(gotCurrentCourse(resp.data.result))
    })
  }
}
