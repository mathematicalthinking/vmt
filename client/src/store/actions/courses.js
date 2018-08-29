import * as actionTypes from './actionTypes';
import { updateUserCourses, updateUserCourseTemplates } from './user';
import { createdCourseTemplate } from './courseTemplates';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import * as loading from './loading';


//@TODO HAVE MORE ACTIONS HERE FOR TRACKING STATUS OF REQUEST i.e. pending erro success
export const gotCourses = (courses) => {
  return {
  type: actionTypes.GOT_COURSES,
  byId: courses.byId,
  allIds: courses.allIds
}}

// params: course = un-normalized backend model
export const updateCourse = course => ({
  type: actionTypes.UPDATE_COURSE,
  course,
})

export const updateCourseAssignments = (courseId, assignmentId) => ({
  type: actionTypes.UPDATE_COURSE_ASSIGNMENTS,
  courseId,
  assignmentId,
})

export const clearCurrentCourse = () => ({
  type: actionTypes.CLEAR_COURSE,
})

export const createdCourse = resp => {
  return {
    type: actionTypes.CREATED_COURSE,
    course: resp,
  }
}

export const updateCourseRooms = (courseId, roomId) => {
  return {
    type: actionTypes.UPDATE_COURSE_ROOMS,
    courseId,
    roomId,
  }
}

export const removeCourse = courseId => {
  return {
    type: actionTypes.REMOVE_COURSE,
    courseId,
  }
}

export const getCourses = () => {
  return dispatch => {
    API.get('course')
    .then(res => {
      // Normalize data
      const courses = normalize(res.data.results)
      dispatch(gotCourses(courses))
    })
    .catch(err => console.log(err));
  }
}

export const populateCurrentCourse = id => {
  return dispatch => {
    API.getById('course', id)
    .then(res => {
      dispatch(updateCourse(res.data.result))})
    .catch(err => console.log(err))
  }
}

export const createCourse = body => {
  return dispatch => {
    dispatch(loading.start())
    API.post('course', body)
    .then(res =>{
      if (body.template) {
        dispatch(updateUserCourseTemplates(res.data.result[1]._id))
        // BUG THE ORDER HERE MATTERS. IF WE UPDATE USERCOURSES BEFORE COURSES THE getUserResource SELECTOR WILL FAIL
        // AND CAUSE THE COURSES COMPONENT TO ERROR
        dispatch(createdCourse(res.data.result[0]))
        dispatch(createdCourseTemplate(res.data.result[1]))
        // NB If we're creating a template we're going to get back two results in an array (the course that was created & then template that was created)
        return dispatch(updateUserCourses(res.data.result[0]._id))
      }
      dispatch(createdCourse(res.data.result))
      dispatch(updateUserCourses(res.data.result._id))
      dispatch(loading.success())
    })
    .catch(err => console.log(err))
  }
}
