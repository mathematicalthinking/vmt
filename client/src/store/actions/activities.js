import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import { addUserActivities, removeUserActivities } from './user';
// import { createdActivityTemplate } from './activityTemplates';
import { addCourseActivities, removeCourseActivities } from './courses';

import * as loading from './loading';

export const gotActivities = (activities) => ({
  type: actionTypes.GOT_ACTIVITIES,
  byId: activities.byId,
  allIds: activities.allIds
})

export const addActivity = activity => ({
  type: actionTypes.ADD_ACTIVITY,
  activity,
})

export const clearCurrentActivity = () => {
  return {
    type: actionTypes.CLEAR_ACTIVITY
  }
}

export const createdActivity = resp => {
  const newActivity = resp
  return {
    type: actionTypes.CREATED_ACTIVITY,
    newActivity,
  }
}

export const addActivityRooms = (activityId, roomIdsArr) => {
    return {
      type: actionTypes.ADD_ACTIVITY_ROOMS,
      activityId,
      roomIdsArr,
    }
}

export const activityRemoved = (activityId) => {
  return {
    type: actionTypes.REMOVE_ACTIVITY,
    activityId,
  }
}

export const getActivities = params => {
  return dispatch => {
    dispatch(loading.start())
    API.get('activities', params)
    .then(res => {
      // Normalize res
      const activities = normalize(res.data.results)
      dispatch(gotActivities(activities))
      dispatch(loading.success())
    })
    .catch(err => console.log(err));
  }
}

export const getCurrentActivity = id => {
  return dispatch => {
    dispatch(loading.start())
    API.getById('activities', id)
    .then(res => {
      dispatch(loading.success())
      dispatch(addActivity(res.data.result))
    })
  }
}

export const createActivity = body => {
  return dispatch => {
    dispatch(loading.start())
    API.post('activities', body)
    .then(res => {
      let result = res.data.result;
      dispatch(createdActivity(result))
      if (body.course) {
        dispatch(addCourseActivities(body.course, [result._id]))
      }
      dispatch(addUserActivities([result._id]))
      return dispatch(loading.success());
    })
  }
}

// @TODO MAKE SURE ONLY CREATOR CAN REMOVE
export const removeActivity = activityId => {
  return dispatch => {
    dispatch(loading.start())
    API.remove('activities', activityId)
    .then(res => {
      dispatch(removeUserActivities([activityId]))
      dispatch(removeCourseActivities(res.data.result.course, [activityId]))
      dispatch(activityRemoved(activityId))
      dispatch(loading.success())
    })
  }
}


export const UpdateCurrentActivity = body => {}

export const createdActivityConfirmed = () => {
  return {
    type: actionTypes.CREATE_ACTIVITY_CONFIRMED,
  }
}
