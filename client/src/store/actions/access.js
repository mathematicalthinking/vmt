import {
  updatedCourse,
  updatedRoom,
  removeNotification,
  addUserRooms,
  addRoomMember,
  addUserCourses,
  addCourseMember,
} from './index';
import * as loading from './loading';
import { buildLog } from '../utils';
import API from '../../utils/apiRequests';

export const joinWithCode = (
  resource,
  resourceId,
  userId,
  username,
  entryCode
) => {
  return dispatch => {
    console.log('entering with code');
    API.enterWithCode(resource, resourceId, userId, entryCode)
      .then(res => {
        console.log('ENtRY WIH CODE success!: ', res);
        if (resource === 'rooms') {
          dispatch(addUserRooms([resourceId]));
          // let room = res.data.result;
          // room.log = buildLog(room.tabs, room.chat);
          // console.log(room.log);
          // dispatch(updatedRoom(room._id, room.tabs));
          dispatch(
            addRoomMember(resourceId, {
              role: 'participant',
              user: { _id: userId, username: username },
            })
          );
        } else if (resource === 'courses') {
          dispatch(addUserCourses([resourceId]));
          dispatch(
            addCourseMember(resourceId, {
              role: 'participant',
              user: { _id: userId, username: username },
            })
          );
        }

        return dispatch(loading.success());
      })
      .catch(err => {
        console.log(err);
        dispatch(loading.fail('That entry code was incorrect. Try again.'));
      });
  };
};

export const requestAccess = (owners, userId, resource, resourceId) => {
  return dispatch => {
    dispatch(loading.start());
    API.requestAccess(owners, userId, resource, resourceId)
      .then(res => {
        dispatch(loading.success());
        return dispatch(loading.accessSuccess());
      })
      .catch(err => {
        return dispatch(loading.fail());
      });
  };
};

export const grantAccess = (user, resource, resourceId, ntfId, toUserId) => {
  console.log(user);
  return (dispatch, getState) => {
    // dispatch(loading.start())
    API.removeNotification(ntfId)
      .then(res => {
        dispatch(removeNotification(ntfId));
        // dispatch(gotUser(res.data))
      })
      .catch(err => console.log(err));
    API.grantAccess(user, resource, resourceId, 'grantedAccess')
      .then(res => {
        console.log('res', res);
        if (resource === 'rooms' || resource === 'room') {
          dispatch(updatedRoom(resourceId, { members: res.data })); // change to add
        } else if (resource === 'courses' || resource === 'course') {
          dispatch(updatedCourse(resourceId, { members: res.data })); // change to add
        }
        // let { user } = getState()
        // let singResource = resource.slice(0, resource.length - 1) // <-- THIS IS ANNOTING \\ WE COULD JUST REANME THE FIELD courseSnotifications?
        // let updatedNotifications = user[`${singResource}Notifications`]
        // updatedNotifications.access = user[`${singResource}Notifications`].access.filter(ntf => {
        //   return ntf._id !== resourceId
        // })
        // dispatch(loading.success())
      })
      .catch(err => {
        console.log(err);
        dispatch(loading.fail(err));
      });
  };
};
