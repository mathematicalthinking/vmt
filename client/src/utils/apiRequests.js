import axios from 'axios';

let baseURL = process.env.REACT_APP_SERVER_URL_PRODUCTION;
if (process.env.REACT_APP_STAGING) {
  baseURL = process.env.REACT_APP_SERVER_URL_STAGING;
} else if (
  process.env.REACT_APP_DEV ||
  process.env.NODE_ENV === 'development' ||
  process.env.NODE_ENV === 'test' ||
  process.env.REACT_APP_TEST
) {
  baseURL = process.env.REACT_APP_SERVER_URL_DEV;
}

// console.log('server url: ', baseURL);
const api = axios.create({ baseURL });

export default {
  get: (resource, params) => {
    return api.get(`/api/${resource}`, params ? { params } : {});
  },

  search: (resource, text, exclude) => {
    return api.get(`/api/search/${resource}`, { params: { text, exclude } });
  },

  searchPaginated: (resource, criteria, skip, filters) => {
    const { privacySetting, roomType } = filters;
    const params = criteria ? { criteria, skip } : { skip };
    if (privacySetting !== null) params.privacySetting = privacySetting;
    if (roomType !== null) params.roomType = roomType;
    return api.get(`/api/searchPaginated/${resource}`, { params });
  },

  post: (resource, body) => {
    return api.post(`/api/${resource}`, body);
  },

  put: (resource, id, body) => {
    return api.put(`/api/${resource}/${id}`, body);
  },

  getById: (resource, id, temp, events, encompass) => {
    if (temp) {
      return api.get(`/api/${resource}/${id}/tempRoom`, { params: { events } });
    }

    if (encompass) {
      return api.get(`/api/vmt/${resource}/${id}`);
    }

    if (events) {
      return api.get(`/api/${resource}/${id}`, { params: { events } });
    }
    // Generic 'GET /api/user/{ID}' call
    return api.get(`/api/${resource}/${id}`);
  },
  getWithCode: (resource, code) => {
    return api.post(`/api/${resource}/code`, { code });
  },

  getPopulatedById: (resource, id, temp, events, encompass) => {
    if (temp) {
      return api.get(`/api/${resource}/${id}/tempRoom`, {
        params: { events },
      });
    }

    if (encompass) {
      return api.get(`/api/vmt/${resource}/${id}`);
    }

    if (events) {
      return api.get(`/api/${resource}/${id}/populated`, {
        params: { events },
      });
    }

    return api.get(`/api/${resource}/${id}/populated`);
  },

  remove: (resource, id) => {
    return api.delete(`/api/${resource}/${id}`);
  },

  enterWithCode: (resource, resourceId, userId, entryCode) => {
    return api.put(`/api/${resource}/${resourceId}`, {
      checkAccess: { userId, entryCode },
    });
  },

  requestAccess: (owners, userId, resource, resourceId) => {
    let resourceType;
    if (resource === 'courses' || resource === 'course') {
      resourceType = 'course';
    }
    if (resource === 'rooms' || resource === 'room') {
      resourceType = 'room';
    }
    // @TODO consider making notificationTypes a directory of constants like action types in redux
    const promises = owners.map((owner) => {
      // return axios.put(`/api/user/${owner}`, {notificationType: 'requestAccess', user: userId, resource, _id: resourceId})
      return api.post('api/notifications', {
        resourceType,
        resourceId,
        notificationType: 'requestAccess',
        toUser: owner,
        fromUser: userId,
      });
    });
    return Promise.all(promises);
  },

  removeNotification: (ntfId) => {
    return api.put(`/api/notifications/${ntfId}`, {
      isTrashed: true,
    });
  },

  removeMember: (resource, resourceId, user) => {
    return api.put(`/api/${resource}/${resourceId}/remove`, {
      members: { user },
    });
  },

  addUserResource: (resource, resourceId, userId) => {
    return api.put(`/api/user/${userId}/add`, { [resource]: resourceId });
  },

  inviteUser: () => {},

  grantAccess: (user, resource, resourceId, ntfType, options) => {
    return api.put(`/api/${resource}s/${resourceId}/add`, {
      members: {
        user,
        role: options && options.guest ? 'guest' : 'participant',
      },
      ntfType,
    });
  },

  updateMembers: (resource, resourceId, updatedMembers) => {
    return api.put(`/api/${resource}/${resourceId}`, {
      members: updatedMembers,
    });
  },
  getDesmos: (url) => {
    return api.get(`/desmos?url=${url}`);
  },
  // getDesmosActivity: (link) => {
  //   try {
  //     link = link.split('/');
  //     const code = link[link.length - 1];
  //     return api.get(
  //       `https://teacher.desmos.com/activitybuilder/export/${code}`
  //     );
  //   } catch (err) {
  //     console.log('Error- could not fetch URL, defaulting activity url: ', err);
  //     return api.get(
  //       `https://teacher.desmos.com/activitybuilder/export/5ddbf9ae009cd90bcdeaadd7`
  //     );
  //   }
  // },
  uploadGgbFiles: (formData) => {
    return api.post(`/api/upload/ggb`, formData);
  },
  getRecentActivity: (resource, criteria, skip, filters) => {
    const { since, to } = filters;
    const params = criteria ? { criteria, skip } : { skip };
    if (since !== null) params.since = since;
    if (to !== null) params.to = to;

    // backend uses singular user for some reason
    // this should be made to be consistent
    if (resource === 'users') {
      resource = 'user';
    }
    return api.get(`/api/dashBoard/${resource}`, { params });
  },

  revokeRefreshToken: (userId) => {
    return api.post(`/admin/forceUserLogout/${userId}`);
  },
  suspendUser: (userId) => {
    return api.post(`/admin/suspendUser/${userId}`);
  },
  reinstateUser: (userId) => {
    return api.post(`/admin/reinstateUser/${userId}`);
  },
};
