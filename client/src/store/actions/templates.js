import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';

export const gotTemplates = (resource, templates) => {
  const type = (resource === 'room') ? actionTypes.GOT_ROOM_TEMPLATES : actionTypes.GOT_COURSE_TEMPLATES;
  return { type, templates, }
}

export const createdTemplate = (resource, template) => {
  const type = (resource === 'room') ? actionTypes.CREATED_ROOM_TEMPLATE : actionTypes.CREATED_COURSE_TEMPLATE;
  return { type, template, }
}

export const getTemplates = resource => {
  return dispatch => {
    API.get(`${resource}Template`)
    .then(res => dispatch(gotTemplates(resource, res.data.results)))
  }

}

export const createTemplate = (resource, body) => {
  return dispatch => {
    API.post(`${resource}Template`, body)
    .then(res => dispatch(createdTemplate(resource, res.data.result)))
  }
}
