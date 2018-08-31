import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import { addUserAssignments, removeUserAssignments } from './user';
// import { createdAssignmentTemplate } from './assignmentTemplates';
import { addCourseAssignments, removeCourseAssignments } from './courses';

import * as loading from './loading';

export const gotAssignments = (assignments) => ({
  type: actionTypes.GOT_ASSIGNMENTS,
  byId: assignments.byId,
  allIds: assignments.allIds
})

export const addAssignment = assignment => ({
  type: actionTypes.ADD_ASSIGNMENT,
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

export const addAssignmentRooms = (assignmentId, roomId) => {
    return {
      type: actionTypes.ADD_ASSIGNMENT_ROOMS,
      assignmentId,
      roomId,
    }
}

export const assignmentRemoved = (assignmentId) => {
  return {
    type: actionTypes.REMOVE_ASSIGNMENT,
    assignmentId,
  }
}

export const getAssignments = params => {
  return dispatch => {
    API.get('assignment', params)
    .then(res => {
      // Normalize res
      const assignments = normalize(res.data.results)
      dispatch(gotAssignments(assignments))
    })
    .catch(err => console.log(err));
  }
}

export const getCurrentAssignment = id => {
  return dispatch => {
    API.getById('assignment', id)
    .then(res => dispatch(addAssignment(res.data.result)))
  }
}

export const createAssignment = body => {
  return dispatch => {
    API.post('assignment', body)
    .then(res => {
      let result = res.data.result;
      dispatch(createdAssignment(result))
      if (body.course) {
        dispatch(addCourseAssignments(body.course, result._id))
      }
      return dispatch(addUserAssignments(result._id))
    })
  }
}

// @TODO MAKE SURE ONLY CREATOR CAN REMOVE
export const removeAssignment = assignmentId => {
  return dispatch => {
    dispatch(loading.start())
    API.remove('assignment', assignmentId)
    .then(res => {
      console.log(res.data)
      dispatch(removeUserAssignments(assignmentId))
      dispatch(removeCourseAssignments(res.data.result.course, assignmentId))
      dispatch(assignmentRemoved(assignmentId))
      dispatch(loading.success())
    })
  }
}


export const UpdateCurrentAssignment = body => {}

export const createdAssignmentConfirmed = () => {
  return {
    type: actionTypes.CREATE_ASSIGNMENT_CONFIRMED,
  }
}
