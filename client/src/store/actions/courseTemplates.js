import * as actionTypes from './actionTypes';
import API from '../../utils/apiRequests';

export const gotCourseTemplates = (templates, templateIds) => {
  return {
    type: actionTypes.GOT_COURSE_TEMPLATES,
    templates,
    templateIds,
  }
}

export const createdCourseTemplate = template => {
  console.log(template)
  return {
    type: actionTypes.CREATED_COURSE_TEMPLATE,
    template,
  }
}

export const getCourseTemplates = params => {
  return dispatch => {
    API.get('courseTemplate', params)
    .then(res => {
      // Normalize Data
      const courseTemplates = res.data.results.reduce((acc, current) => {
        acc[current._id] = current;
        return acc;
      }, {});
      const templateIds = res.data.results.map(template => template._id)
      dispatch(gotCourseTemplates(courseTemplates, templateIds))
    })
  }

}

export const createTemplate = (resource, body) => {
  return dispatch => {
    API.post(`${resource}Template`, body)
    .then(res => dispatch(createdCourseTemplate(resource, res.data.result)))
  }
}
