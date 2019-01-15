import * as actionTypes from './actionTypes';
import {
  addUserCourses,
  // addUserCourseTemplates,
  removeUserCourse,
  removeUserRooms,
  removeUserActivities,
  activitiesRemoved,
  roomsRemoved,
  clearLoadingInfo,
} from './index';
import { createdCourseTemplate } from './courseTemplates';
import API from '../../utils/apiRequests';
import { normalize } from '../utils/normalize';
import * as loading from './loading';


//@TODO HAVE MORE ACTIONS HERE FOR TRACKING STATUS OF REQUEST i.e. pending erro success
export const gotCourses = (courses) => {
  return {
  type: actionTypes.GOT_COURSES,
  byId: courses.byId,
  allIds: courses.allIds
}}

// params: course = un-normalized backend model
export const updatedCourse = (courseId, body) => ({
  type: actionTypes.UPDATED_COURSE,
  courseId,
  body,
})

export const addCourseActivities = (courseId, activityIdsArr) => ({
  type: actionTypes.ADD_COURSE_ACTIVITIES,
  courseId,
  activityIdsArr,
})

//@TODO REMOVE THIS
export const clearCurrentCourse = () => ({
  type: actionTypes.CLEAR_COURSE,
})

export const createdCourse = resp => {
  return {
    type: actionTypes.CREATED_COURSE,
    course: resp,
  }
}

export const addCourseRooms = (courseId, roomIdsArr) => {
  return {
    type: actionTypes.ADD_COURSE_ROOMS,
    courseId,
    roomIdsArr,
  }
}

export const addCourseMember = (courseId, newMember) => {
  return {
    type: actionTypes.ADD_COURSE_MEMBER,
    courseId,
    newMember,
  }
}

export const removeCourseActivities = (courseId, activityIdsArr) => {
  return {
    type: actionTypes.REMOVE_COURSE_ACTIVITIES,
    courseId,
    activityIdsArr,
  }
}

export const removeCourseRooms = (courseId, roomIdsArr) => {
  return {
    type: actionTypes.REMOVE_COURSE_ROOMS,
    courseId,
    roomIdsArr,
  }
}

export const courseRemoved = (courseId) => {
  return {
    type: actionTypes.REMOVE_COURSE,
    courseId,
  }
}

export const removeCourseMember = (courseId, userId) => {
  return dispatch => {
    dispatch(loading.start())
    API.removeMember('courses', courseId, userId)
    .then(res => {
      dispatch(updatedCourse(courseId, {members: res.data}))
      dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail(err.response.data.errorMessage)))
  }
}

export const updateCourseMembers = (courseId, updatedMembers) => {
  return dispatch => {
    dispatch(loading.start())
    API.updateMembers('courses', courseId, updatedMembers)
    .then(res => {
      dispatch(updatedCourse(courseId, {members: res.data.result.members}))
      dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail(err.response.data.errorMessage)))
  }
}

// export const removeCourse = courseId => {
//   return dispatch => {
//     dispatch(loading.start())
//     API.remove('courses', courseId)
//     .then(res => {
//       // remove course from user
//       dispatch(removeUserCourse(courseId))
//         // remove courseRooms from user
//         dispatch(removeUserRooms)
//         // remove courseActivities from user
//         // remove courseRooms
//         // remove courseActivities
//       dispatch(courseRemoved(courseId))
//       return dispatch(loading.success())
//     })
//   }
// }

export const updateCourse = (id, body) => {
  return (dispatch, getState) => {
    let course = {...getState().courses.byId[id]};
    if (body.isTrashed) {
      dispatch(removeUserCourse(id));
      dispatch(courseRemoved(id));
    } else {
      dispatch(updatedCourse(id, body));
    }
    API.put('courses', id, body)
    .then(res => {
      if (body.trashChildren) {
        let { activities, rooms } = course;
        dispatch(removeUserActivities(activities));
        dispatch(activitiesRemoved(activities));
        dispatch(removeUserRooms(rooms));
        dispatch(roomsRemoved(rooms));
      }
      return;
    })
    .catch(err => {
      // Undo updates because something went wrong with the server/connection

      let prevCourse = {};
      let keys = Object.keys(body);
      keys.forEach(key => {
        prevCourse[key] = course[key];
      })

      if (body.isTrashed) {
        dispatch(createdCourse(course))
        dispatch(addUserCourses(id))
      }
      dispatch(updatedCourse(id, prevCourse));
      dispatch(loading.updateFail('course', keys));
      setTimeout(() => {
        dispatch(clearLoadingInfo())
      }, 2000)
    })
  }
}

export const getCourses = (params) => {
  return dispatch => {
    API.get('courses', params)
    .then(res => {
      // Normalize data
      const courses = normalize(res.data.results)
      dispatch(gotCourses(courses))
    })
    .catch(err => console.log(err));
  }
}
export const getCoursesIds = ids => {
  return dispatch => {
    API.getIds('courses', ids)
    .then(res => {
      // Normalize res
      let rooms = normalize(res.data.results)
      dispatch(gotCourses(rooms))
      dispatch(loading.success())
    })
    .catch(err => dispatch(loading.fail(err.response.data.errorMessage)));
  }
}

export const getCourse = id => {
  return dispatch => {
    dispatch(loading.start())
    API.getById('courses', id)
    .then(res => {
      dispatch(updatedCourse(id, res.data.result))
      dispatch(loading.success())
    })
    .catch(err => {
      dispatch(loading.fail(err.response.data.errorMessage))
    })
  }
}

// export const populateCurrentCourse = id => {
//   return dispatch => {
//     API.getById('courses', id)
//     .then(res => {
//       dispatch(updateCourse(res.data.result))})
//     .catch(err => console.log(err))
//   }
// }

export const createCourse = body => {
  return dispatch => {
    dispatch(loading.start())
    API.post('courses', body)
    .then(res =>{
      if (body.template) {
        // dispatch(addUserCourseTemplates(res.data.result[1]._id))
        // BUG THE ORDER HERE MATTERS. IF WE UPDATE USERCOURSES BEFORE COURSES THE getUserResource SELECTOR WILL FAIL
        // AND CAUSE THE COURSES COMPONENT TO ERROR
        dispatch(createdCourse(res.data.result[0]))
        // dispatch(createdCourseTemplate(res.data.result[1]))
        // NB If we're creating a template we're going to get back two results in an array (the course that was created & then template that was created)
        return dispatch(addUserCourses(res.data.result[0]._id))
      }
      dispatch(createdCourse(res.data.result))
      dispatch(addUserCourses([res.data.result._id]))
      dispatch(loading.success())
    })
    .catch(err => console.log(err))
  }
}
