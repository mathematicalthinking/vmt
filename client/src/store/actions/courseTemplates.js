import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';

export const gotCourseTemplates = (resource, templates) => {
  const type = (resource === 'room') ? actionTypes.GOT_ROOM_TEMPLATES : actionTypes.GOT_COURSE_TEMPLATES;
  return { type, templates, }
}

export const createdCourseTemplate = template => {
  return {
    type: actionTypes.CREATED_COURSE_TEMPLATE,
    template,
  }
}

export const getCourseTemplates = params => {
  return dispatch => {
    API.get('courseTemplate', params)
    .then(res => dispatch(gotCourseTemplates(res.data.results)))
  }

}

export const createTemplate = (resource, body) => {
  return dispatch => {
    API.post(`${resource}Template`, body)
    .then(res => dispatch(createdCourseTemplate(resource, res.data.result)))
  }
}
