import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import { addUserActivitys, removeUserActivitys } from './user';
// import { createdActivityTemplate } from './activityTemplates';
import { addCourseActivitys, removeCourseActivitys } from './courses';

import * as loading from './loading';

export const gotActivitys = (activitys) => ({
  type: actionTypes.GOT_ASSIGNMENTS,
  byId: activitys.byId,
  allIds: activitys.allIds
})

export const addActivity = activity => ({
  type: actionTypes.ADD_ASSIGNMENT,
  activity,
})

export const clearCurrentActivity = () => {
  return {
    type: actionTypes.CLEAR_ASSIGNMENT
  }
}

export const createdActivity = resp => {
  const newActivity = resp
  return {
    type: actionTypes.CREATED_ASSIGNMENT,
    newActivity,
  }
}

export const addActivityRooms = (activityId, roomIdsArr) => {
    return {
      type: actionTypes.ADD_ASSIGNMENT_ROOMS,
      activityId,
      roomIdsArr,
    }
}

export const activityRemoved = (activityId) => {
  return {
    type: actionTypes.REMOVE_ASSIGNMENT,
    activityId,
  }
}

export const getActivitys = params => {
  return dispatch => {
    dispatch(loading.start())
    API.get('activity', params)
    .then(res => {
      // Normalize res
      const activitys = normalize(res.data.results)
      dispatch(gotActivitys(activitys))
      dispatch(loading.success())
    })
    .catch(err => console.log(err));
  }
}

export const getCurrentActivity = id => {
  return dispatch => {
    dispatch(loading.start())
    API.getById('activity', id)
    .then(res => {
      dispatch(loading.success())
      dispatch(addActivity(res.data.result))
    })
  }
}

export const createActivity = body => {
  return dispatch => {
    dispatch(loading.start())
    API.post('activity', body)
    .then(res => {
      let result = res.data.result;
      dispatch(createdActivity(result))
      if (body.course) {
        dispatch(addCourseActivitys(body.course, [result._id]))
      }
      dispatch(addUserActivitys([result._id]))
      return dispatch(loading.success());
    })
  }
}

// @TODO MAKE SURE ONLY CREATOR CAN REMOVE
export const removeActivity = activityId => {
  return dispatch => {
    dispatch(loading.start())
    API.remove('activity', activityId)
    .then(res => {
      console.log(res.data)
      dispatch(removeUserActivitys([activityId]))
      dispatch(removeCourseActivitys(res.data.result.course, [activityId]))
      dispatch(activityRemoved(activityId))
      dispatch(loading.success())
    })
  }
}


export const UpdateCurrentActivity = body => {}

export const createdActivityConfirmed = () => {
  return {
    type: actionTypes.CREATE_ASSIGNMENT_CONFIRMED,
  }
}
