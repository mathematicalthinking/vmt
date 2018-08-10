import * as actionTypes from './actionTypes';
import { updateUserRoomTemplates } from './user'
import API from '../../utils/apiRequests';

export const gotRoomTemplates = (templates, templateIds) => {
  return {
    type: actionTypes.GOT_ROOM_TEMPLATES,
    templates,
    templateIds
  }
}

export const createdRoomTemplate = template => {
  return {
    type: actionTypes.CREATED_ROOM_TEMPLATE,
    template,
  }
}

export const getRoomTemplates = params => {
  return dispatch => {
    API.get('roomTemplate', params)
    .then(res => {
      // Normalize data
      const roomTemplates = res.data.results.reduce((acc, current) => {
        acc[current._id] = current;
        return acc;
      }, {});
      const templateIds = res.data.results.map(template => template._id)
      dispatch(gotRoomTemplates(roomTemplates, templateIds))
    })
  }
}

export const createRoomTemplate = body => {
  return dispatch => {
    API.post('roomTemplate', body)
    .then(res => {
      dispatch(createdRoomTemplate(res.data.result))
      dispatch(updateUserRoomTemplates(res.data.result._id))
    })
  }
}
