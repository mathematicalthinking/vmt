import * as actionTypes from './actionTypes';
import { activitiesRemoved, removeUserActivities } from './activities';
import { roomsRemoved, removeUserRooms } from './rooms';
import API from '../../utils/apiRequests';
import { normalize } from '../utils';
import * as loading from './loading';

// @TODO HAVE MORE ACTIONS HERE FOR TRACKING STATUS OF REQUEST i.e. pending erro success
export const gotCourses = (courses) => {
  return {
    type: actionTypes.GOT_COURSES,
    byId: courses.byId,
    allIds: courses.allIds,
  };
};

// params: course = un-normalized backend model
export const updatedCourse = (courseId, body) => ({
  type: actionTypes.UPDATED_COURSE,
  courseId,
  body,
});

// @TODO REMOVE THIS
export const clearCurrentCourse = () => ({
  type: actionTypes.CLEAR_COURSE,
});

export const createdCourse = (resp) => {
  return {
    type: actionTypes.CREATED_COURSE,
    course: resp,
  };
};

export const addCourseMember = (courseId, newMember) => {
  return {
    type: actionTypes.ADD_COURSE_MEMBER,
    courseId,
    newMember,
  };
};

export const courseRemoved = (courseId) => {
  return {
    type: actionTypes.REMOVE_COURSE,
    courseId,
  };
};

export const addUserCourses = (newCoursesArr) => {
  return {
    type: actionTypes.ADD_USER_COURSES,
    newCoursesArr,
  };
};

export const removeUserCourse = (courseId) => {
  return {
    type: actionTypes.REMOVE_USER_COURSE,
    courseId,
  };
};

export const removeCourseMember = (courseId, userId) => {
  return (dispatch, getState) => {
    dispatch(loading.start());
    API.removeMember('courses', courseId, userId)
      .then((res) => {
        dispatch(updatedCourse(courseId, { members: res.data }));
        // If removing self
        if (userId === getState().user._id) {
          dispatch(removeUserCourse(courseId));
        }
        dispatch(loading.success());
      })
      .catch((err) => dispatch(loading.fail(err.response.data.errorMessage)));
  };
};

// export const getWithCode = (code) => {
//   return (dispatch) => {
//     dispatch(loading.start());
//     API.getWithCode('courses', code)
//       .then((res) => {
//         dispatch(updatedCourse(courseId, { members: res.data }));
//         dispatch(loading.success());
//       })
//       .catch((err) => dispatch(loading.fail(err.response.data.errorMessage)));
//   };
// };

export const updateCourseMembers = (courseId, updatedMembers) => {
  return (dispatch) => {
    dispatch(loading.start());
    API.updateMembers('courses', courseId, updatedMembers)
      .then((res) => {
        dispatch(updatedCourse(courseId, { members: res.data.members }));
        dispatch(loading.success());
      })
      .catch((err) => dispatch(loading.fail(err.response.data.errorMessage)));
  };
};

export const updateCourse = (id, body) => {
  return (dispatch, getState) => {
    const course = { ...getState().courses.byId[id] };
    if (body.isTrashed) {
      dispatch(removeUserCourse(id));
      dispatch(courseRemoved(id));
    } else {
      dispatch(updatedCourse(id, body));
    }
    API.put('courses', id, body)
      .then(() => {
        if (body.trashChildren) {
          const { activities, rooms } = course;
          dispatch(removeUserActivities(activities));
          dispatch(activitiesRemoved(activities));
          dispatch(removeUserRooms(rooms));
          dispatch(roomsRemoved(rooms));
        }
      })
      .catch(() => {
        // Undo updates because something went wrong with the server/connection

        const prevCourse = {};
        const keys = Object.keys(body);
        keys.forEach((key) => {
          prevCourse[key] = course[key];
        });

        if (body.isTrashed) {
          dispatch(createdCourse(course));
          dispatch(addUserCourses(id));
        }
        dispatch(updatedCourse(id, prevCourse));
        dispatch(loading.updateFail('course', keys));
        setTimeout(() => {
          dispatch(loading.clearLoadingInfo());
        }, 2000);
      });
  };
};

export const getCourses = (params) => {
  return (dispatch) => {
    API.get('courses', params)
      .then((res) => {
        // Normalize data
        const courses = normalize(res.data.results);
        dispatch(gotCourses(courses));
      })
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err));
  };
};

export const getCourse = (id) => {
  return (dispatch) => {
    dispatch(loading.start());
    API.getById('courses', id)
      .then((res) => {
        dispatch(updatedCourse(id, res.data.result));
        dispatch(loading.success());
      })
      .catch((err) => {
        dispatch(loading.fail(err.response.data.errorMessage));
      });
  };
};

export const inviteToCourse = (courseId, toUserId, toUserUsername, options) => {
  return (dispatch) => {
    dispatch(
      addCourseMember(courseId, {
        user: { _id: toUserId, username: toUserUsername },
        role: options && options.guest ? 'guest' : 'participant',
      })
    );
    API.grantAccess(toUserId, 'course', courseId, 'invitation', options)
      .then()
      // eslint-disable-next-line no-console
      .catch((err) => console.log(err));
  };
};

export const createCourse = (body) => {
  return (dispatch) => {
    dispatch(loading.start());
    API.post('courses', body)
      .then((res) => {
        if (body.template) {
          // dispatch(addUserCourseTemplates(res.data.result[1]._id))
          // BUG THE ORDER HERE MATTERS. IF WE UPDATE USERCOURSES BEFORE COURSES THE getUserResource SELECTOR WILL FAIL
          // AND CAUSE THE COURSES COMPONENT TO ERROR
          res.data.results[0].myRole = 'facilitator';
          dispatch(createdCourse(res.data.result[0]));
          // dispatch(createdCourseTemplate(res.data.result[1]))
          // NB If we're creating a template we're going to get back two results in an array (the course that was created & then template that was created)
          return dispatch(addUserCourses(res.data.result[0]._id));
        }
        res.data.result.myRole = 'facilitator'; // follows the pattern used when adding a room
        dispatch(createdCourse(res.data.result));
        dispatch(addUserCourses([res.data.result._id]));
        return dispatch(loading.success());
      })
      .catch((err) => {
        dispatch(loading.fail());
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };
};
