import * as actionTypes from './actionTypes';
import {
  addUserCourses,
  addUserCourseTemplates,
  removeUserCourse,
  removeUserRooms,
} from './user';
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
export const updateCourse = (id, body) => ({
  type: actionTypes.UPDATE_COURSE,
  id,
  body,
})

export const addCourseActivities = (courseId, activityIdsArr) => ({
  type: actionTypes.ADD_COURSE_ACTIVITIES,
  courseId,
  activityIdsArr,
})

//@TODO REMOVE THIS
export const clearCurrentCourse = () => ({
  type: actionTypes.CLEAR_COURSE,
})

export const createdCourse = resp => {
  return {
    type: actionTypes.CREATED_COURSE,
    course: resp,
  }
}

export const addCourseRooms = (courseId, roomIdsArr) => {
  return {
    type: actionTypes.ADD_COURSE_ROOMS,
    courseId,
    roomIdsArr,
  }
}

export const removeCourseActivities = (courseId, activityIdsArr) => {
  return {
    type: actionTypes.REMOVE_COURSE_ACTIVITIES,
    courseId,
    activityIdsArr,
  }
}

export const removeCourseRooms = (courseId, roomIdsArr) => {
  return {
    type: actionTypes.REMOVE_COURSE_ROOMS,
    courseId,
    roomIdsArr,
  }
}

export const courseRemoved = (courseId) => {
  return {
    type: actionTypes.REMOVE_COURSE,
    courseId,
  }
}

export const updateCourseMembers = (courseId, updatedMembers) => {

  return dispatch => {
    API.updateMembers('course', courseId, updatedMembers)
    .then(res => {
      console.log(res)
      dispatch(updateCourse(courseId, res.data.result))
    })
    .catch(err => console.log(err))
  }
}

export const removeCourse = courseId => {
  return dispatch => {
    dispatch(loading.start())
    API.remove('course', courseId)
    .then(res => {
      // remove course from user
      dispatch(removeUserCourse(courseId))
        // remove courseRooms from user
        dispatch(removeUserRooms)
        // remove courseActivities from user
        // remove courseRooms
        // remove courseActivities
      dispatch(courseRemoved(courseId))
      return dispatch(loading.success())
    })
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
        dispatch(addUserCourseTemplates(res.data.result[1]._id))
        // BUG THE ORDER HERE MATTERS. IF WE UPDATE USERCOURSES BEFORE COURSES THE getUserResource SELECTOR WILL FAIL
        // AND CAUSE THE COURSES COMPONENT TO ERROR
        dispatch(createdCourse(res.data.result[0]))
        dispatch(createdCourseTemplate(res.data.result[1]))
        // NB If we're creating a template we're going to get back two results in an array (the course that was created & then template that was created)
        return dispatch(addUserCourses(res.data.result[0]._id))
      }
      dispatch(createdCourse(res.data.result))
      dispatch(addUserCourses([res.data.result._id]))
      dispatch(loading.success())
    })
    .catch(err => console.log(err))
  }
}
