import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import { updateUserAssignments } from './user';
// import { createdAssignmentTemplate } from './assignmentTemplates';
import { updateCourseAssignments } from './courses';

export const gotAssignments = (assignments) => ({
  type: actionTypes.GOT_ASSIGNMENTS,
  byId: assignments.byId,
  allIds: assignments.allIds
})

export const updateAssignment = assignment => ({
  type: actionTypes.UPDATE_ASSIGNMENT,
  assignment,
})

export const clearCurrentAssignment = () => {
  return {
    type: actionTypes.CLEAR_ASSIGNMENT
  }
}

export const createdAssignment = resp => {
  const newAssignment = resp
  return {
    type: actionTypes.CREATED_ASSIGNMENT,
    newAssignment,
  }
}

export const getAssignments = params => {
  return dispatch => {
    API.get('assignment', params)
    .then(res => {
      // Normalize res
      const assignments = normalize(res.data.results)
      console.log(assignments)
      dispatch(gotAssignments(assignments))
    })
    .catch(err => console.log(err));
  }
}

export const getCurrentAssignment = id => {
  return dispatch => {
    API.getById('assignment', id)
    .then(res => dispatch(updateAssignment(res.data.result)))
  }
}

export const createAssignment = body => {
  console.log(body)
  return dispatch => {
    API.post('assignment', body)
    .then(res => {
      let result = res.data.result;
      dispatch(createdAssignment(result))
      console.log("RESPO: ", res)
      if (body.course) {
        dispatch(updateCourseAssignments(body.course, result._id))
      }
      console.log('RESULTS._ID', result._id)
      return dispatch(updateUserAssignments(result._id))
    })
  }
}

export const UpdateCurrentAssignment = body => {}

export const createdAssignmentConfirmed = () => {
  return {
    type: actionTypes.CREATE_ASSIGNMENT_CONFIRMED,
  }
}
