import { combineReducers } from "redux";
import user from "./userReducer";
import rooms from "./roomsReducer";
import courses from "./coursesReducer";
import courseTemplates from "./courseTemplatesReducer";
import activities from "./activitiesReducer";
import loading from "./loadingReducer";
import dnd from "./dndReducer";
// import registrationReducer from './registrationReducer';

const rootReducer = combineReducers({
  user,
  loading,
  courses,
  activities,
  rooms,
  courseTemplates,
  dnd
});

export default rootReducer;

// Selector functions (prepare Data for the UI)
export const getUserResources = (state, resource) => {
  if (state[resource].allIds && state[resource].allIds.length > 0) {
    return state.user[resource].reduce((acc, cur) => {
      // Only get resources that are stand alone (i.e. not belonging to a course)
      let popRec = state[resource].byId[cur];
      if (
        resource === "courses" ||
        (resource !== "courses" && popRec && !popRec.course)
      ) {
        acc.push(popRec);
      }
      return acc;
    }, []);
  }
  return undefined;
};

// store, activities, activity_id, rooms
export const populateResource = (
  state,
  resourceToPop,
  resourceId,
  resources
) => {
  const currentResource = { ...state[resourceToPop].byId[resourceId] };
  resources.forEach(resource => {
    let populatedResources;
    if (state[resourceToPop].byId[resourceId][resource]) {
      populatedResources = state[resourceToPop].byId[resourceId][resource]
        .filter(id => {
          return state[resource].byId[id] || null;
        })
        .map(id => {
          return state[resource].byId[id];
        });
    }
    currentResource[resource] = populatedResources;
  });
  return currentResource;
};

export const getAllUsersInStore = (state, usersToExclude) => {
  let userIds = new Set();
  let usernames = new Set();
  state.courses.allIds.forEach(id => {
    state.courses.byId[id].members.forEach(member => {
      if (usersToExclude.indexOf(member.user._id) === -1) {
        userIds.add(member.user._id);
        usernames.add(member.user.username);
      }
    });
  });
  state.rooms.allIds.forEach(id => {
    state.rooms.byId[id].members.forEach(member => {
      if (usersToExclude.indexOf(member.user._id) === -1) {
        userIds.add(member.user._id);
        usernames.add(member.user.username);
      }
    });
  });
  return { userIds, usernames };
};
