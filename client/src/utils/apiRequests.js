import axios from "axios";

export default {
  get: (resource, params) => {
    return axios.get(`/api/${resource}`, params ? { params } : {});
  },

  // getIds: (resource, ids) => {
  //   console.log("DATA: ", ids)
  //   return axios.get(`/api/${resource}/ids`, {
  //     params: {
  //       ids,
  //     },
  //     paramsSerializer: params => parseParams(params)
  //   })
  // },
  search: (resource, text, exclude) => {
    return axios.get(`/api/search/${resource}`, { params: { text, exclude } });
  },

  searchPaginated: (resource, criteria, skip) => {
    return axios.get(`/api/searchPaginated/${resource}`, {
      params: criteria ? { criteria, skip } : { skip }
    });
  },

  post: (resource, body) => {
    return axios.post(`/api/${resource}`, body);
  },

  put: (resource, id, body) => {
    return axios.put(`/api/${resource}/${id}`, body);
  },

  getById: (resource, id, temp) => {
    if (temp) {
      return axios.get(`/api/${resource}/${id}/tempRoom`);
    }
    return axios.get(`/api/${resource}/${id}`);
  },

  remove: (resource, id) => {
    return axios.delete(`/api/${resource}/${id}`);
  },

  enterWithCode: (resource, resourceId, userId, entryCode) => {
    return axios.put(`/api/${resource}/${resourceId}`, {
      checkAccess: { userId, entryCode }
    });
  },

  requestAccess: (owners, userId, resource, resourceId) => {
    let resourceType;
    if (resource === "courses" || resource === "course") {
      resourceType = "course";
    }
    if (resource === "rooms" || resource === "room") {
      resourceType = "room";
    }
    // @TODO consider making notificationTypes a directory of constants like action types in redux
    let promises = owners.map(owner => {
      // return axios.put(`/api/user/${owner}`, {notificationType: 'requestAccess', user: userId, resource, _id: resourceId})
      return axios.post("api/notifications", {
        notificationType: "requestAccess",
        toUser: owner,
        fromUser: userId,
        resourceType: resourceType,
        resourceId: resourceId
      });
    });
    return Promise.all(promises);
  },

  removeNotification: ntfId => {
    return axios.put(`/api/notifications/${ntfId}`, {
      isTrashed: true
    });
  },

  removeMember: (resource, resourceId, user) => {
    return axios.put(`/api/${resource}/${resourceId}/remove`, {
      members: { user }
    });
  },

  addUserResource: (resource, resourceId, userId) => {
    return axios.put(`/api/user/${userId}/add`, { [resource]: resourceId });
  },

  inviteUser: () => {},

  grantAccess: (user, resource, resourceId, ntfType) => {
    return axios.put(`/api/${resource}s/${resourceId}/add`, {
      members: { user, role: "participant" },
      ntfType
    });
  },

  updateMembers: (resource, resourceId, updatedMembers) => {
    return axios.put(`/api/${resource}/${resourceId}`, {
      members: updatedMembers
    });
  },
  getDesmos: url => {
    return axios.get(`/desmos?url=${url}`);
  },
  uploadGgbFiles: formData => {
    return axios.post(`/api/upload/ggb`, formData);
  }
};
