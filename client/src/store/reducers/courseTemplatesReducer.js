import * as actionTypes from "../actions/actionTypes";
const initialState = {
  byId: {},
  allIds: []
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case actionTypes.GOT_COURSE_TEMPLATES:
      return {
        ...state,
        byId: action.templates,
        allIds: action.templateIds
      };
    case actionTypes.CREATED_COURSE_TEMPLATE:
      let updatedCourseTemplates = { ...state.byId };
      updatedCourseTemplates[action.template._id] = action.template;
      return {
        ...state,
        byId: updatedCourseTemplates,
        allIds: [action.template._id, ...state.allIds]
      };
    default:
      return state;
  }
};

export default reducer;
