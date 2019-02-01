import * as actionTypes from "./actionTypes";
import { addUserCourseTemplates } from "./user";
import API from "../../utils/apiRequests";

export const gotCourseTemplates = (templates, templateIds) => {
  return {
    type: actionTypes.GOT_COURSE_TEMPLATES,
    templates,
    templateIds
  };
};

export const createdCourseTemplate = template => {
  return {
    type: actionTypes.CREATED_COURSE_TEMPLATE,
    template
  };
};

export const getCourseTemplates = params => {
  return dispatch => {
    API.get("courseTemplate", params).then(res => {
      // Normalize Data
      const courseTemplates = res.data.results.reduce((acc, current) => {
        acc[current._id] = current;
        return acc;
      }, {});
      const templateIds = res.data.results.map(template => template._id);
      dispatch(gotCourseTemplates(courseTemplates, templateIds));
    });
  };
};

export const createCourseTemplate = body => {
  return dispatch => {
    API.post("courseTemplate", body).then(res => {
      // BUG ORDER MATTERS HERE! BAD!!!! can we even gaurantee the order in which these dispatches will resolve? Yes Iguess so ? they're synchronous
      dispatch(createdCourseTemplate(res.data.result));
      dispatch(addUserCourseTemplates(res.data.result._id));
    });
  };
};
